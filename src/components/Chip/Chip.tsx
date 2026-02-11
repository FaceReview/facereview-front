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

const Chip = ({
  type,
  choose,
  style,
  isSelected,
  onClick,
}: ChipPropsType): ReactElement => {
  const fontOfType = {
    'category-big': 'font-label-large',
    'category-small': 'font-label-medium',
  };
  const labelOfChoose = {
    all: '전체',
    happy: `${EMOTION_EMOJIS.happy} ${EMOTION_LABELS.happy}`,
    surprise: `${EMOTION_EMOJIS.surprise} ${EMOTION_LABELS.surprise}`,
    angry: `${EMOTION_EMOJIS.angry} ${EMOTION_LABELS.angry}`,
    sad: `${EMOTION_EMOJIS.sad} ${EMOTION_LABELS.sad}`,
    neutral: `${EMOTION_EMOJIS.neutral} ${EMOTION_LABELS.neutral}`,
    plus: <img className="plus-icon" src={plusIcon} alt="plusIcon" />,
  };

  // Create a class string based on the type and emotion
  const chipClass = `chip ${type} ${choose} ${fontOfType[type]} ${
    isSelected ? 'selected' : ''
  }`;

  return (
    <button type="button" className={chipClass} style={style} onClick={onClick}>
      {labelOfChoose[choose]}
    </button>
  );
};

export default Chip;
