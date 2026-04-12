import React, { ReactElement } from 'react';
import ProfileIcon from 'components/ProfileIcon/ProfileIcon';
import SomeIcon from 'components/SomeIcon/SomeIcon';
import { CommentType } from 'types';
import { mapNumberToEmotion } from 'utils/index';

// Hoisted constant style to avoid re-creation on every render
const profileIconStyle = { marginRight: '12px' };

type CommentItemProps = CommentType & {
  hoveredComment: string | null;
  isEditVisible: string | null;
  onMouseEnter: (commentId: string) => void;
  onMouseLeave: () => void;
  onEditClick: (commentId: string) => void;
  onDeleteClick: () => void;
  onStartEditing: (commentId: string) => void;
};

const CommentItem = React.memo(
  ({
    user_name,
    created_at,
    content,
    user_profile_image_id,
    is_modified,
    is_mine,
    comment_id,
    hoveredComment,
    isEditVisible,
    onMouseEnter,
    onMouseLeave,
    onEditClick,
    onDeleteClick,
    onStartEditing,
  }: CommentItemProps): ReactElement => {
    return (
      <div
        className="comment-item-container"
        onMouseEnter={() => {
          if (is_mine) {
            onMouseEnter(comment_id);
          }
        }}
        onMouseLeave={onMouseLeave}>
        <ProfileIcon
          type={'icon-small'}
          color={mapNumberToEmotion(user_profile_image_id)}
          style={profileIconStyle}
        />
        <div className="comment-right-container">
          <div className="comment-text-wrapper">
            <div className="comment-info-wrapper">
              <div className="comment-nickname font-label-small">
                {user_name}
              </div>
              <div className="comment-time-text font-label-small">
                {created_at}
                {is_modified ? <>(수정됨)</> : null}
              </div>
            </div>
            <div className="comment-text font-body-medium">{content}</div>
          </div>

          <div className="comment-icon-container">
            {hoveredComment === comment_id && (
              <SomeIcon
                type={'more'}
                onClick={() => onEditClick(comment_id)}
              />
            )}
            <div
              className={`comment-edit-container ${
                isEditVisible === comment_id && 'visible'
              }`}>
              <div
                className="comment-modify-text"
                onClick={() => {
                  onStartEditing(comment_id);
                }}>
                <div className="comment-modify-dim"></div>
                수정
              </div>
              <div
                className="comment-delete-text"
                onClick={onDeleteClick}>
                <div className="comment-delete-dim"></div>
                삭제
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CommentItem.displayName = 'CommentItem';

export default CommentItem;
