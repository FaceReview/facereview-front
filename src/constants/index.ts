import { CategoryType } from 'types';

export const CATEGORY_ITEMS: {
  id: CategoryType;
  label: string;
  emoji: string;
}[] = [
  { id: 'drama', label: '드라마', emoji: '🎭' },
  { id: 'eating', label: '먹방', emoji: '🍽️' },
  { id: 'travel', label: '여행', emoji: '✈️' },
  { id: 'cook', label: '요리', emoji: '🧑‍🍳' },
  { id: 'show', label: '예능', emoji: '🎪' },
  { id: 'information', label: '정보', emoji: '📊' },
  { id: 'game', label: '게임', emoji: '🎮' },
  { id: 'sports', label: '스포츠', emoji: '🤾‍♀️' },
  { id: 'music', label: '음악', emoji: '🎵' },
  { id: 'animal', label: '동물', emoji: '🐶' },
  { id: 'beauty', label: '뷰티', emoji: '💄' },
  { id: 'comedy', label: '코미디', emoji: '🤣' },
  { id: 'horror', label: '공포', emoji: '🧟‍♀️' },
  { id: 'exercise', label: '운동', emoji: '🏋️‍♂️' },
  { id: 'vlog', label: '브이로그', emoji: '📷' },
  { id: 'etc', label: '기타', emoji: '🎸' },
];

export const CATEGORIES: CategoryType[] = CATEGORY_ITEMS.map((item) => item.id);

export const EMOTIONS = [
  'happy',
  'surprise',
  'sad',
  'angry',
  'neutral',
] as const;

export const EMOTION_LABELS = {
  happy: '즐거운',
  surprise: '놀라운',
  sad: '슬픈',
  angry: '화나는',
  neutral: '평온한',
} as const;

export const EMOTION_EMOJIS = {
  happy: '😄',
  surprise: '😲',
  sad: '😥',
  angry: '😠',
  neutral: '😐',
} as const;

export const EMOTION_COLORS = {
  happy: '#FF4D8D',
  surprise: '#92C624',
  sad: '#479CFF',
  angry: '#FF6B4B',
  neutral: '#5d5d6d',
} as const;
