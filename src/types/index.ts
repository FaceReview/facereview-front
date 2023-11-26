export type EmotionType = "happy" | "surprise" | "sad" | "angry" | "neutral";
export type UserInfoType = {
  user_role: boolean;
  user_name: string;
  user_profile: number;
  user_tutorial: number;
  access_token: string;
  refresh_token: string;
};
export type VideoDataType = {
  youtube_url: string;
  youtube_title: string;
  youtube_most_emotion: EmotionType;
  youtube_most_emotion_per: number;
};
export type VideoDetailType = {
  youtube_index: number;
  youtube_url: string;
  youtube_title: string;
  youtube_channel: string;
  youtube_comment_num: string;
  youtube_hits: number;
  youtube_like: number;
};
export type VideoWatchedType = {
  youtube_title: string;
  youtube_url: string;
  most_emotion: EmotionType;
  most_emotion_per: number;
};
