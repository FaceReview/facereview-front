export type CategoryType =
  | 'drama'
  | 'eating'
  | 'travel'
  | 'cook'
  | 'show'
  | 'information'
  | 'game'
  | 'sports'
  | 'music'
  | 'animal'
  | 'beauty'
  | 'comedy'
  | 'horror'
  | 'exercise'
  | 'vlog'
  | 'etc';
export type EmotionType = 'happy' | 'surprise' | 'sad' | 'angry' | 'neutral';
export type UserInfoType = {
  user_role: boolean;
  user_name: string;
  user_profile: number;
  user_tutorial: number;
  access_token: string;
  refresh_token: string;
  user_favorite_genre_1: string;
  user_favorite_genre_2: string;
  user_favorite_genre_3: string;
};
export type VideoDataType = {
  video_id: string;
  id?: string;
  uuid?: string;
  youtube_url: string;
  title: string;
  dominant_emotion: EmotionType;
  dominant_emotion_per: number;
};
export type VideoDetailType = {
  video_id: string;
  title: string;
  channel_name: string;
  comment_count: number;
  view_count: number;
  like_count: number;
  duration: number;
  user_is_liked: boolean;
  youtube_url: string;
  timeline_data: any; // Using any for now or strictly typing if possible
};
export type VideoWatchedType = {
  title: string;
  video_id: string;
  id?: string;
  uuid?: string;
  youtube_url: string;
  most_emotion: EmotionType;
  most_emotion_per: number;
  distribution_data: {
    graph_data: GraphDistributionDataType[];
  };
};
export type VideoDistributionDataType = {
  [key in EmotionType]: { x: string | number; y: number }[];
};

export type GraphDistributionDataType = {
  id: EmotionType;
  data: { x: string | number; y: number }[];
};
export type CommentType = {
  comment_id: string;
  user_id: string;
  user_name: string;
  user_profile_image_id: number;
  content: string;
  is_modified: boolean;
  created_at: string;
  is_mine: boolean;
};

export type VideoRelatedType = {
  video_id: string;
  id?: string;
  uuid?: string;
  youtube_url: string;
  title: string;
  dominant_emotion: EmotionType;
  dominant_emotion_per: number;
};

export type ReqeustedVideoType = {
  request_id: string;
  youtube_url: string;
  created_at: string;
  index: number; // Keeping index just in case, but request_id is key
};

export type YoutubeVideoDataType = {
  items: {
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
    };
    contentDetails: { duration: string };
  }[];
};

export type RegisterVideoDataType = {
  video_url: string;
  title: string;
  channel_name: string;
  length_hour: number;
  length_minute: number;
  length_second: number;
  category: string;
};

export type DonutGraphDataType = {
  angry_per_avg: number;
  happy_per_avg: number;
  sad_per_avg: number;
  surprise_per_avg: number;
  neutral_per_avg: number;
};

export type UpdateProfileRequest = {
  name: string;
  profile_image_id: number;
  favorite_genres: string[];
};

export type EmailCheckResponse = {
  is_duplicate: boolean;
  message: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

export type UserResponse = {
  user_id: string;
  email: string;
  name: string;
  profile_image_id: number;
  is_tutorial_done: boolean;
  is_verify_email_done: boolean;
  role: 'GENERAL' | 'ADMIN';
  created_at: string;
  favorite_genres: string[];
};
export type SearchVideoResponse = {
  videos: VideoDataType[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
};
