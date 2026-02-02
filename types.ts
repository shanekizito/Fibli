
export type TStoryGist = {
  id?: string;
  title: string;
  preview: string;
  image: string;
  chapters: string[];
  user_id: string;
  age_range: string;
  length: string;
  mood: string;
  isEdited?: boolean;
  invited?: boolean;
  created_at?: string;
  story_id?: string;
}

export type TChapter = {
  title: string;
  content: string;
  image: string;
}

export type TStory = {
  id?: string;
  title: string;
  preview: string;
  image: string;
  chapters: TChapter[];
  user_id: string;
}