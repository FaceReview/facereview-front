import { ReactElement } from 'react';
import './chip.scss';

import plusIcon from 'assets/img/plusIcon.png';
import { EmotionType } from 'types/index';
import { EMOTION_EMOJIS, EMOTION_LABELS } from 'constants/index';

type ChipPropsType = {
  type: 'category-big' | 'category-small';
  choose: 'all' | EmotionType | 'plus';
  style?: React.CSSProperties;
  isSelected?: boolean;
  onClick: () => void;
};

const FONT_OF_TYPE = {
  'category-big': 'font-label-large',
  'category-small': 'font-label-medium',
} as const;

const LABEL_OF_CHOOSE: Record<
  Exclude<ChipPropsType['choose'], 'plus'>,
  string
> = {
  all: '전체',
  happy: `${EMOTION_EMOJIS.happy} ${EMOTION_LABELS.happy}`,
  surprise: `${EMOTION_EMOJIS.surprise} ${EMOTION_LABELS.surprise}`,
  angry: `${EMOTION_EMOJIS.angry} ${EMOTION_LABELS.angry}`,
  sad: `${EMOTION_EMOJIS.sad} ${EMOTION_LABELS.sad}`,
  neutral: `${EMOTION_EMOJIS.neutral} ${EMOTION_LABELS.neutral}`,
};

const Chip = ({
  type,
  choose,
  style,
  isSelected,
  onClick,
}: ChipPropsType): ReactElement => {
  const isPlus = choose === 'plus';
  const chipClass = `chip ${type} ${choose} ${FONT_OF_TYPE[type]} ${
    isSelected ? 'selected' : ''
  }`;

  return (
    <button
      type="button"
      className={chipClass}
      style={style}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={isPlus ? '영상 추가' : LABEL_OF_CHOOSE[choose]}>
      {isPlus ? (
        <img className="plus-icon" src={plusIcon} alt="" aria-hidden="true" />
      ) : (
        LABEL_OF_CHOOSE[choose]
      )}
    </button>
  );
};

export default Chip;
