import { TStoryGist } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { LANGUAGES, OPENAI_API_KEY } from './config';
import { generateImage } from './stability';
import { downloadAndSaveImage, getTitles } from './supabase';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

if (!openai.apiKey) {
  throw new Error('OpenAI API key is not set');
}

interface IStoryGistInput {
  title: string;
  length: 'short' | 'medium' | 'long';
  ageRange: "3-5" | "6-8" | "9-12";
  mood: "happy" | "educational" | "adventurous" | "calming" | "magical";
}

const lengthMap = {
  'short': '1-3 chapters',
  'medium': '4-6 chapters',
  'long': '7-9 chapters'
}

export const generateStoryGist = async ({
  title,
  length,
  ageRange,
  mood
}: IStoryGistInput) => {
  try {
    // First, generate the story gist
    const langCode = await AsyncStorage.getItem('language') || 'en';
    const language = LANGUAGES.find(l => l.code === langCode)?.name || 'English';

    const storyResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
You are an expert children's storyteller specializing in creating engaging, age-appropriate bedtime stories.
Your language should be ${language} and story style should follow the ${language} culture in the story preview and the story chapters.
All image prompts MUST be in English regardless of the story language.

# STORY PARAMETERS
- Title: "${title}"
- Mood: ${mood}
- Length: ${lengthMap[length]}
- Target Age: ${ageRange} years old

# STORYTELLING GUIDELINES
1. For ages 3-5: Use simple language, repetitive patterns, and clear moral lessons. Focus on familiar settings and characters.
2. For ages 6-8: Include more complex plots, introduce basic problem-solving, and incorporate humor and light adventure.
3. For ages 9-12: Develop deeper characters, include more sophisticated themes, and create more intricate plots.

# MOOD-SPECIFIC ELEMENTS
- Happy: Include positive outcomes, friendship themes, and moments of joy and laughter.
- Educational: Weave in age-appropriate facts, learning moments, and curiosity-inspiring elements.
- Adventurous: Create exciting challenges, mild suspense, and moments of bravery and discovery.
- Calming: Use soothing imagery, gentle pacing, and reassuring themes perfect for bedtime.
- Magical: Incorporate wonder, fantasy elements, and imaginative scenarios that spark creativity.

# CHAPTER STRUCTURE
- Beginning chapters: Introduce characters and setting, establish the main situation
- Middle chapters: Develop challenges or conflicts appropriate to the age group
- Final chapters: Provide satisfying resolution with age-appropriate lessons or takeaways

# OUTPUT FORMAT
Return your response in the following JSON format:
{
  "preview": "A compelling 3-4 sentences summary that captures the story's essence and appeal",
  "imagePrompt": "A detailed, child-friendly description for generating an illustration that captures the essence of the story. For each main character, clearly specify their type (e.g., animal, magical creature, object), physical characteristics (size, color scheme, distinctive features), and any accessories or clothing they wear. For example, 'Luna the purple butterfly with silver-sparkled wings and a tiny golden crown' or 'Max the friendly brown rabbit with round glasses and a blue backpack'. These character descriptions will serve as the foundation for maintaining consistent character appearances throughout all chapter illustrations. Include details about the setting, mood, and key story elements. Use a 3D Pixar-style cartoon aesthetic with warm lighting and rich details. Avoid any scary elements and ensure it's appropriate for young children. All image prompts MUST be in English regardless of the story language. (min 200 words)",
  "chapters": [
    "Chapter 1: [Descriptive Title] - Engaging description that sets up the beginning (30-40 words)",
    "Chapter 2: [Descriptive Title] - Compelling description for the next story development (30-40 words)",
    ...
    "Chapter [N]: [Descriptive Title] - Satisfying description that provides resolution (30-40 words)"
  ]
}

Ensure the number of chapters matches the requested length (${lengthMap[length]}).
Make sure the JSON is properly formatted and valid.
`
        }
      ],
      temperature: 1,
      response_format: { type: "json_object" }
    });

    // Parse the story response
    const storyContent = JSON.parse(storyResponse.choices[0].message.content || '{}');

    // Generate an image using DALL-E based on the image prompt
    const imagePrompt = storyContent.imagePrompt ||
      `Create a child-friendly book cover illustration for a ${mood} bedtime story titled "${title}" targeting ${ageRange} year olds.

STYLE:
- 3D Pixar-style animation
- Soft, warm lighting with gentle highlights
- Rich, vibrant colors
- Cinematic composition
- Front-facing, centered main character(s)

MOOD AND TONE:
${mood === 'happy' ? '- Cheerful characters with bright smiles\n- Playful, uplifting atmosphere\n- Sunny, warm color palette' :
        mood === 'educational' ? '- Curious, engaged character expressions\n- Learning-focused environment\n- Clean, organized composition' :
          mood === 'adventurous' ? '- Dynamic, exciting poses\n- Sense of wonder and discovery\n- Rich landscape elements' :
            mood === 'calming' ? '- Gentle, soothing color palette\n- Peaceful expressions\n- Soft, dreamy lighting' :
              '- Whimsical, enchanted atmosphere\n- Subtle sparkles or glowing elements\n- Dreamy color palette'}

AGE-APPROPRIATE ELEMENTS:
${ageRange === '3-5' ? '- Simple, clear shapes\n- Bold, primary colors\n- Friendly, approachable characters' :
        ageRange === '6-8' ? '- More detailed environments\n- Varied color palette\n- Characters showing clear emotions' :
          '- Complex scene composition\n- Sophisticated color schemes\n- Detailed character designs'}

COMPOSITION:
- Main character(s) prominently featured in the center
- Balanced foreground and background elements
- Clear focal point
- Book cover-style layout
- Room for title text at the top

SAFETY:
- No scary or threatening elements
- Age-appropriate content only
- Welcoming and inviting atmosphere
- Safe, positive environment

View: Front-facing, slightly elevated angle
Camera: Medium shot, ensuring clear view of main elements
Lighting: Soft, diffused main light with gentle rim lighting`;

    try {
      const imageUint8Array = await generateImage(imagePrompt);
      const imageUrl = await downloadAndSaveImage(imageUint8Array, `${uuidv4()}.webp`);

      // Add the image URL to the story content
      storyContent.image = imageUrl;

      // Remove the imagePrompt field as it's no longer needed
      delete storyContent.imagePrompt;

      return storyContent;
    } catch (error) {
      console.error("Error generating image:", error);

      // If image generation fails, return the story without an image
      delete storyContent.imagePrompt;
      storyContent.image = '';

      return storyContent;
    }
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error(`Failed to generate story: ${error instanceof Error ? error.message : String(error)}`);
  }
}

interface IStoryInput {
  gist: TStoryGist;
}

export const generateStory = async ({
  gist
}: IStoryInput) => {
  try {
    const langCode = await AsyncStorage.getItem('language') || 'en';
    const language = LANGUAGES.find(l => l.code === langCode)?.name || 'English';
    const storyResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
You are an expert children's storyteller specializing in creating engaging, age-appropriate bedtime stories.
You should write a complete story based on the provided gist, maintaining consistent character descriptions and narrative style throughout all chapters.
All image prompts MUST be in English regardless of the story language.

# GIVEN INPUT
${JSON.stringify(gist, null, 2)}

# CHAPTER REQUIREMENTS
- Each chapter should be 300-500 words long
- Use age-appropriate vocabulary and sentence structure
- Include engaging dialogue and descriptive scenes
- Maintain consistent character voices and personalities
- End each chapter with a gentle hook to the next (except final chapter)

# AGE-SPECIFIC GUIDELINES
1. Ages 3-5:
   - Simple sentences and familiar words
   - Repetitive phrases and predictable patterns
   - Clear cause-and-effect relationships
   - Frequent character name mentions
   - Direct dialogue with speech tags

2. Ages 6-8:
   - Varied sentence structures
   - Rich vocabulary with context clues
   - Basic character development
   - Mix of dialogue and description
   - Simple problem-solving scenarios

3. Ages 9-12:
   - Complex sentence structures
   - Advanced vocabulary
   - Deeper character emotions
   - Detailed world-building
   - More sophisticated conflicts

# OUTPUT FORMAT
{
  "chapters": [
    {
      "title": "Chapter Title",
      "content": "Complete chapter content with proper paragraphing and dialogue formatting",
      "imagePrompt": "Scene description for illustration for dall-e, following these rules:
1. CHARACTER CONSISTENCY (Essential):
   - Maintain EXACT physical features established in the story gist
   - Include specific details about facial features, body structure, and clothing
   - Reference character's standard poses and expressions

2. SCENE COMPOSITION:
   - Describe main focal point and character positioning
   - Specify lighting, mood, and atmosphere
   - Include relevant background elements and setting details

3. STYLE REQUIREMENTS:
   - 3D Pixar-style animation aesthetic
   - Warm, inviting lighting
   - Child-friendly elements
   - Rich background details
   - Safe and appropriate content

4. LANGUAGE:
   - All image prompts MUST be in English regardless of the story language.

Minimum 200 words, focusing on visual clarity and maintaining character consistency."
    }
  ]
}

Ensure all JSON is properly formatted and each chapter builds naturally from the previous one.`
        }
      ],
      temperature: 1,
      response_format: { type: "json_object" }
    });

    // Parse the story response
    const storyContent = JSON.parse(storyResponse.choices[0].message.content || '{}');

    const chapters = await Promise.all(storyContent.chapters.map(async (chapter: any) => {
      const imageUint8Array = await generateImage(chapter.imagePrompt);
      const imageUrl = await downloadAndSaveImage(imageUint8Array, `${uuidv4()}.webp`);

      chapter.image = imageUrl;
      delete chapter.imagePrompt;

      return chapter;
    }));
    console.log('chapters', chapters);
    return chapters;
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error(`Failed to generate story: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const suggestTitles = async (user_id: string) => {
  try {
    const langCode = await AsyncStorage.getItem('language') || 'en';
    const language = LANGUAGES.find(l => l.code === langCode)?.name || 'English';
    const existingTitles = await getTitles(user_id);
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
You are an expert children's storyteller specializing in creating engaging, age-appropriate bedtime stories.
Generate exactly 6 unique and creative titles for children's bedtime stories.
Avoid using any of the existing titles provided.
Your language should be ${language}.

# GIVEN INPUT
- Existing Titles: ${existingTitles.map(t => `"${t.title}"`).join(', ')}

# GUIDELINES
- Create whimsical, memorable, and age-appropriate titles
- Each title should be unique and different from existing titles
- Titles should spark curiosity and imagination
- Keep titles relatively short and easy to remember

# OUTPUT FORMAT
Return exactly 6 titles in a JSON array:
{
  "titles": [
    "Creative Title 1",
    "Creative Title 2",
    "Creative Title 3",
    "Creative Title 4"
  ]
}
Make sure the JSON is properly formatted and valid.`
        }
      ],
      temperature: 1,
      response_format: { type: "json_object" }
    });

    const titles = JSON.parse(aiResponse.choices[0].message.content || '{}').titles;
    return titles;
  } catch (error) {
    console.error("Error suggesting title:", error);
    throw new Error(`Failed to suggest title: ${error instanceof Error ? error.message : String(error)}`);
  }
}