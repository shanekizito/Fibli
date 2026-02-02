import { TChapter, TStory, TStoryGist } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

// Initialize the Supabase client
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or key is not set');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const downloadAndSaveImage = async (imageBuffer: Uint8Array, fileName: string) => {
  try {
    // Upload Uint8Array directly to Supabase
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp', // Change this to match your image type
        upsert: true
      });

    if (error) {
      console.error('Error uploading image to storage:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

export const saveStoryGist = async (storyGist: TStoryGist) => {
  const { data, error } = await supabase
    .from('story_gists')
    .insert({
      title: storyGist.title,
      preview: storyGist.preview,
      image: storyGist.image,
      chapters: storyGist.chapters,
      user_id: storyGist.user_id,
      age_range: storyGist.age_range,
      length: storyGist.length,
      mood: storyGist.mood,
    })
    .select('id, image')
    .single();

  if (error) {
    console.error('Error saving story gist:', error);
    throw error;
  }

  return data;
};

export const saveStory = async ({ gist_id, ...story }: TStory & { gist_id: string }) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        title: story.title,
        preview: story.preview,
        image: story.image,
        chapters: story.chapters,
        user_id: story.user_id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving story:', error);
      throw error;
    }

    await supabase
      .from('story_gists')
      .update({
        story_id: data.id,
      })
      .eq('id', gist_id);

    return data;
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
};

export const getStory = async (id: string) => {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .order('created_at', { ascending: false })
    .single();

  if (error) {
    console.error('Error getting story:', error);
    throw error;
  }

  return data;
};

export const getGists = async (userId: string) => {
  const { data, error } = await supabase
    .from('story_gists')
    .select('*')
    .eq('user_id', userId)
    .not('story_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting gists:', error);
    throw error;
  }

  return data;
};

export const updateStory = async ({ id, title, chapters }: { id: string, title: string, chapters: TChapter[] }) => {
  const { data, error } = await supabase
    .from('stories')
    .update({ title, chapters })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating story:', error);
    throw error;
  }

  const { error: updateGistError } = await supabase
    .from('story_gists')
    .update({ title: title, isEdited: true })
    .eq('story_id', id);

  if (updateGistError) {
    console.error('Error updating gist:', updateGistError);
    throw updateGistError;
  }

  return data;
};

export const deleteStory = async (story_id: string) => {
  const { data: gistData, error } = await supabase
    .from('story_gists')
    .delete()
    .eq('story_id', story_id)
    .select('image')
    .single();

  if (error) {
    console.error('Error deleting story:', error);
    throw error;
  }

  const { data: storyData, error: deleteStoryError } = await supabase
    .from('stories')
    .delete()
    .eq('id', story_id)
    .select('chapters')
    .single();

  if (deleteStoryError) {
    console.error('Error deleting story:', deleteStoryError);
    throw deleteStoryError;
  }

  // Extract just the filename from the full URL
  const getFilenameFromUrl = (url: string): string => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const gistImagePath = getFilenameFromUrl(gistData?.image);
  if (gistImagePath) {
    await supabase.storage.from('images').remove([gistImagePath]);
  }

  if (storyData?.chapters) {
    await Promise.all(storyData.chapters.map(async (chapter: TChapter) => {
      const chapterImagePath = getFilenameFromUrl(chapter.image);
      if (chapterImagePath) {
        await supabase.storage.from('images').remove([chapterImagePath]);
      }
    }));
  }
};

export const getTitles = async (user_id: string) => {
  const { data, error } = await supabase
    .from('story_gists')
    .select('title')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting titles:', error);
    throw error;
  }

  return data;
};

export const getStoryById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('story_gists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error('Invalid invite code');
    }
    return data;
  } catch (error) {
    console.error('Error in getStoryByInviteCode:', error);
    return null;
  }
};

export const checkStoryExists = async ({ title, user_id }: { title: string, user_id: string }) => {
  const { data, error } = await supabase
    .from('story_gists')
    .select('*')
    .eq('title', title)
    .eq('user_id', user_id)

  if (error) {
    console.error('Error checking story exists:', error);
    throw error;
  }

  return data?.length > 0;
};

export const addInvitedStory = async ({ gist_id, user_id }: { gist_id: string, user_id: string }) => {
  console.log("User ID on invite", user_id)
  const { data, error } = await supabase
    .from('story_gists')
    .update({ inviting: true })
    .eq('id', gist_id)
    .select('*')
    .single();

  const { error: storyError } = await supabase
    .from('story_gists')
    .insert({
      user_id,
      title: data.title,
      preview: data.preview,
      image: data.image,
      chapters: data.chapters,
      age_range: data.age_range,
      length: data.length,
      mood: data.mood,
      story_id: data.story_id,
      invited: true
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding invited story:', error);
    throw error;
  }

  if (storyError) {
    console.error('Error adding invited story:', storyError);
    throw storyError;
  }
};

export const removeGist = async (gist_id: string) => {
  const { error } = await supabase
    .from('story_gists')
    .delete()
    .eq('id', gist_id)

  if (error) {
    console.error('Error removing story gist:', error);
    throw error;
  }
}