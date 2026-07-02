import './someicon.scss';
import { ReactElement } from 'react';
import nextIcon from 'assets/img/nextIcon.png';
import closeIcon from 'assets/img/closeIcon.png';
import moreIcon from 'assets/img/moreIcon.png';

type SomeIconPropsType = {
  type: 'large-next' | 'small-next' | 'close' | 'more';
  style?: React.CSSProperties;
  onClick?: () => void;
  label?: string;
};

const ICON_SRC: Record<SomeIconPropsType['type'], string> = {
  'large-next': nextIcon,
  'small-next': nextIcon,
  close: closeIcon,
  more: moreIcon,
};

const ICON_ALT: Record<SomeIconPropsType['type'], string> = {
  'large-next': '다음',
  'small-next': '다음',
  close: '닫기',
  more: '더보기',
};

const SomeIcon = ({
  type,
  style,
  onClick,
  label,
}: SomeIconPropsType): ReactElement => {
  return (
    <button
      type="button"
      className={`some-icon ${type}`}
      style={style}
      onClick={onClick}
      aria-label={label ?? ICON_ALT[type]}>
      <img
        className={`some-icon-image ${type}`}
        src={ICON_SRC[type]}
        alt={ICON_ALT[type]}
      />
    </button>
  );
};

export default SomeIcon;
