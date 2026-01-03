export type CategoryType =
  | 'sports'
  | 'game'
  | 'news'
  | 'travel'
  | 'cook'
  | 'comedy'
  | 'fear'
  | 'drama'
  | 'review'
  | 'fancam'
  | 'talking'
  | 'information'
  | 'music'
  | 'show'
  | 'eating'
  | 'comic'
  | 'health'
  | 'vlog';
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
  distribution_data: {
    graph_data: GraphDistributionDataType[];
  };
};
export type VideoDistributionDataType = {
  [key in EmotionType]: { x: string; y: number }[];
};

export type GraphDistributionDataType = {
  id: EmotionType;
  data: { x: string; y: number }[];
};
export type CommentType = {
  comment_contents: string;
  comment_date: string;
  comment_index: number;
  modify_check: number;
  user_name: string;
  user_profile: number;
  identify: number;
};

export type VideoRelatedType = {
  youtube_title: string;
  youtube_url: string;
  most_emotion: EmotionType;
  emotion_per: number;
};

export type ReqeustedVideoType = {
  index: number;
  full_url: string;
  url: string;
};

export type YoutubeVideoDataType = {
  items: [
    {
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
      };
      contentDetails: { duration: string };
    }
  ];
};

export type RegisterVideoDataType = {
  youtube_url: string;
  youtube_title: string;
  youtube_channel: string;
  youtube_length_hour: number;
  youtube_length_minute: number;
  youtube_length_second: number;
  youtube_category: string;
};

export type DonutGraphDataType = {
  angry_per_avg: number;
  happy_per_avg: number;
  sad_per_avg: number;
  surprise_per_avg: number;
  neutral_per_avg: number;
};
