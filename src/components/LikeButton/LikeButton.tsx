import React, { ReactElement } from 'react';
import './likebutton.scss';
import likeEmpty from 'assets/img/likeEmpty.png';
import likeFilled from 'assets/img/likeFilled.png';

type LikeButtonPropsType = {
  label: string;
  style?: React.CSSProperties;
  isActive: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
};

const LikeButton = ({
  label,
  style,
  isActive,
  isDisabled,
  onClick,
}: LikeButtonPropsType): ReactElement => {
  return (
    <button
      type="button"
      className="like-button"
      style={style}
      onClick={onClick}
      disabled={isDisabled}
      aria-pressed={isActive}
      aria-label={isActive ? '좋아요 취소' : '좋아요'}>
      <img
        className="like-image"
        src={isActive ? likeFilled : likeEmpty}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
      />
      <p className="font-label-small like-text">{label}</p>
    </button>
  );
};

export default LikeButton;
