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
      className={`like-button`}
      style={style}
      onClick={isDisabled ? () => {} : onClick}>
      {isActive ? (
        <img className={'like-image'} src={likeFilled} alt="like button" />
      ) : (
        <img className={'like-image'} src={likeEmpty} alt="like button" />
      )}
      <p className="font-label-small like-text">{label}</p>
    </button>
  );
};

export default LikeButton;
