import { useState } from 'react';
import { EMOTIONS } from 'constants/index';
import { toast } from 'react-toastify';
import Button from 'components/Button/Button';
import TextInput from 'components/TextInput/TextInput';
import { useNavigate } from 'react-router-dom';
import './editpage.scss';
import ProfileIcon from 'components/ProfileIcon/ProfileIcon';
import ModalDialog from 'components/ModalDialog/ModalDialog';
import { CategoryType, EmotionType } from 'types';
import { useAuthStorage } from 'store/authStore';
import { updateProfile } from 'api/auth';
import { mapEmotionToNumber, mapNumberToEmotion } from 'utils/index';
import CategoryList from 'components/CategoryList/CategoryList';
import useMediaQuery from 'hooks/useMediaQuery';
import useWindowSize from 'hooks/useWindowSize';

const EditPage = () => {
  const isMobile = useMediaQuery('(max-width: 1200px)');
  const windowWidth = useWindowSize();
  const setUserName = useAuthStorage((s) => s.setUserName);
  const setUserProfile = useAuthStorage((s) => s.setUserProfile);
  const setUserFavoriteGenres = useAuthStorage((s) => s.setUserFavoriteGenres);
  const user_name = useAuthStorage((s) => s.user_name);
  const user_profile = useAuthStorage((s) => s.user_profile);
  const user_favorite_genres = useAuthStorage((s) => s.user_favorite_genres);
  const navigate = useNavigate();
  const [nickName, setNickName] = useState(user_name);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    user_favorite_genres as CategoryType[],
  );
  const [selectedColor, setSelectedColor] = useState<EmotionType>(
    mapNumberToEmotion(user_profile),
  );
  const [committedColor, setCommittedColor] = useState<EmotionType>(
    mapNumberToEmotion(user_profile),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleColorSelect = (color: EmotionType) => {
    setSelectedColor(color);
  };

  const openModal = () => {
    document.body.style.overflow = 'hidden';
    setIsModalOpen(true);
  };
  const closeModal = () => {
    document.body.style.overflow = 'auto';
    setIsModalOpen(false);
  };
  const handleModalCheck = () => {
    updateProfile({
      name: nickName,
      profile_image_id: mapEmotionToNumber(selectedColor),
      favorite_genres: selectedCategories as string[],
    })
      .then((res) => {
        setCommittedColor(selectedColor);
        if (res.status === 200) {
          setUserProfile({ user_profile: mapEmotionToNumber(selectedColor) });
          toast.success('프로필사진이 변경되었어요', {
            toastId: 'success change profile image',
          });
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error('프로필사진 변경에 실패했어요');
      });

    setIsModalOpen(false);
  };

  const handleEditButtonClick = () => {
    updateProfile({
      name: nickName,
      profile_image_id: mapEmotionToNumber(committedColor),
      favorite_genres: selectedCategories as string[],
    })
      .then((res) => {
        if (res.status === 200) {
          setUserName({ user_name: nickName });
          setUserFavoriteGenres({ user_favorite_genres: selectedCategories });
          toast.success('회원정보가 수정되었어요', {
            toastId: 'success change info',
          });
          navigate('/my');
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error('회원정보 수정에 실패했어요');
      });
  };

  return (
    <>
      <div className="edit-page-container">
        <h2 className="font-title-large">프로필 편집</h2>
        <div className="edit-page-user-container">
          <ProfileIcon
            type={'icon-large'}
            color={committedColor}
            isEditable={true}
            onEditClick={openModal}
          />
          <ModalDialog isOpen={isModalOpen} onClose={closeModal}>
            <div className="edit-page-modal-container">
              <h3 className="font-title-mini edit-page-modal-title">
                아이콘을 선택해주세요
              </h3>
              <div className="edit-page-modal-icon-wrapper">
                {EMOTIONS.map((emotion, index) => (
                  <ProfileIcon
                    key={emotion}
                    type="icon-medium"
                    color={emotion}
                    onSelectClick={() => handleColorSelect(emotion)}
                    style={{
                      cursor: 'pointer',
                      marginRight: index !== EMOTIONS.length - 1 ? '10px' : 0,
                      border:
                        selectedColor === emotion
                          ? '3px solid #76FFCE'
                          : 'none',
                    }}
                  />
                ))}
              </div>
              <div className="edit-page-modal-button-wrapper">
                <Button
                  label={'확인'}
                  variant={'cta-full'}
                  onClick={() => {
                    closeModal();
                    handleModalCheck();
                  }}
                />
              </div>
            </div>
          </ModalDialog>
          <div className="edit-page-edit-container">
            <div className="edit-page-input-container">
              <label htmlFor="editNickName" className="font-title-mini">
                닉네임
              </label>
              <TextInput
                id={'editNickName'}
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                placeholder={'하하호호'}
                style={
                  isMobile
                    ? {
                        width: windowWidth - 32,
                        marginTop: '16px',
                        marginBottom: '24px',
                      }
                    : {
                        width: '380px',
                        marginTop: '16px',
                        marginBottom: '48px',
                      }
                }
              />
              {nickName.length < 2 && (
                <p className="edit-page-input-alert-message font-body-large">
                  최소 2자이상 입력해주세요.
                </p>
              )}
            </div>
            <div className="edit-page-category-wrapper">
              <label
                htmlFor="editCategory"
                className="font-title-mini"
                style={{ marginBottom: '20px' }}>
                관심사 (필수)
              </label>
              <div className="category-wrapper" style={{ marginTop: '20px' }}>
                <CategoryList
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>
              {selectedCategories.length < 1 && (
                <p className="edit-page-input-alert-message font-body-large">
                  최소 1개의 카테고리를 선택해주세요
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          label="수정"
          variant="cta-full"
          style={
            isMobile
              ? { width: windowWidth - 32, marginTop: '16px' }
              : { width: '380px', marginTop: '16px' }
          }
          disabled={nickName.length < 2 || selectedCategories.length < 1}
          onClick={handleEditButtonClick}
        />
      </div>
    </>
  );
};

export default EditPage;
