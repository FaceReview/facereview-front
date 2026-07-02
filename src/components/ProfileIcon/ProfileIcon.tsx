import './profileicon.scss';
import ProfileImage from 'assets/img/profileImage.png';
import EditableImage from 'assets/img/editableImage.png';

import { ReactElement } from 'react';
import { EmotionType } from 'types/index';

type ProfileIconPropsType = {
  type: 'icon-large' | 'icon-medium' | 'icon-small';
  color: EmotionType;
  style?: React.CSSProperties;
  isEditable?: boolean;
  onEditClick?: () => void;
  onSelectClick?: () => void;
};

const handleKeyDown =
  (handler?: () => void) =>
  (e: React.KeyboardEvent): void => {
    if (!handler) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };

const ProfileIcon = ({
  type,
  color,
  style,
  isEditable,
  onEditClick,
  onSelectClick,
}: ProfileIconPropsType): ReactElement => {
  const interactiveProps = onSelectClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: onSelectClick,
        onKeyDown: handleKeyDown(onSelectClick),
        'aria-label': '프로필 선택',
      }
    : {};

  return (
    <div
      className={`profile-icon ${type} ${color}`}
      style={style}
      {...interactiveProps}
    >
      {onSelectClick && <div className="profile-icon-dim"></div>}
      <img
        className={`profile-image ${type}`}
        src={ProfileImage}
        alt="프로필 이미지"
      />
      <img
        className={`editable-image ${type} ${isEditable ? 'editable' : ''}`}
        src={EditableImage}
        alt={onEditClick ? '프로필 편집' : '편집 가능'}
        role={onEditClick ? 'button' : undefined}
        tabIndex={onEditClick ? 0 : undefined}
        onClick={onEditClick}
        onKeyDown={handleKeyDown(onEditClick)}
      />
    </div>
  );
};

export default ProfileIcon;
