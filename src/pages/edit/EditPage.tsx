import { useEffect, useState } from 'react';
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
import useMediaQuery from 'utils/useMediaQuery';

const EditPage = () => {
  const isMobile = useMediaQuery('(max-width: 1200px)');
  const {
    user_name,
    setUserName,
    setUserProfile,
    user_favorite_genres,
    setUserFavoriteGenres,
  } = useAuthStorage();
  const user_profile = useAuthStorage((state) => state.user_profile);
  const navigate = useNavigate();
  const [nickName, setNickName] = useState(user_name);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    user_favorite_genres as CategoryType[]
  );
  const [profileColor, setProfileColor] = useState<EmotionType>(
    mapNumberToEmotion(user_profile)
  );
  const [selectedColor, setSelectedColor] = useState<EmotionType>(
    mapNumberToEmotion(user_profile)
  );
  const [localProfileColor, setLocalProfileColor] = useState<EmotionType>(
    mapNumberToEmotion(user_profile)
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
    setProfileColor(selectedColor);

    updateProfile({
      name: nickName,
      profile_image_id: mapEmotionToNumber(selectedColor),
      favorite_genres: selectedCategories as string[], // Ensure string[] type
    })
      .then((res) => {
        setLocalProfileColor(selectedColor);
        if (res.status === 200) {
          setUserProfile({ user_profile: mapEmotionToNumber(selectedColor) });
          toast.success('프로필사진이 변경되었어요', {
            toastId: 'success change profile image',
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });

    setIsModalOpen(false);
  };

  const handleEditButtonClick = () => {
    updateProfile({
      name: nickName,
      profile_image_id: mapEmotionToNumber(profileColor), // Use current profile color
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
        console.log(error);
      });
  };

  useEffect(() => {
    setProfileColor(selectedColor);
  }, [selectedColor]);

  return (
    <>
      <div className="edit-page-container">
        <h2 className="font-title-large">프로필 편집</h2>
        <div className="edit-page-user-container">
          <ProfileIcon
            type={'icon-large'}
            color={localProfileColor}
            isEditable={true}
            onEditClick={openModal}
          />
          <ModalDialog
            type={'one-button'}
            name="edit-page-modal"
            isOpen={isModalOpen}
            onClose={closeModal}
            onCheck={handleModalCheck}>
            <h3 className="font-title-mini edit-page-modal-title">
              아이콘을 선택해주세요
            </h3>
            <div className="edit-page-modal-icon-wrapper">
              <ProfileIcon
                type="icon-medium"
                color="neutral"
                onSelectClick={() => handleColorSelect('neutral')}
                style={{
                  cursor: 'pointer',
                  marginRight: '10px',
                  border:
                    selectedColor === 'neutral' ? '3px solid #76FFCE' : 'none',
                }}
              />
              <ProfileIcon
                type="icon-medium"
                color="happy"
                onSelectClick={() => handleColorSelect('happy')}
                style={{
                  cursor: 'pointer',
                  marginRight: '10px',
                  border:
                    selectedColor === 'happy' ? '3px solid #76FFCE' : 'none',
                }}
              />
              <ProfileIcon
                type="icon-medium"
                color="surprise"
                onSelectClick={() => handleColorSelect('surprise')}
                style={{
                  cursor: 'pointer',
                  marginRight: '10px',
                  border:
                    selectedColor === 'surprise' ? '3px solid #76FFCE' : 'none',
                }}
              />
              <ProfileIcon
                type="icon-medium"
                color="sad"
                onSelectClick={() => handleColorSelect('sad')}
                style={{
                  cursor: 'pointer',
                  marginRight: '10px',
                  border:
                    selectedColor === 'sad' ? '3px solid #76FFCE' : 'none',
                }}
              />
              <ProfileIcon
                type="icon-medium"
                color="angry"
                onSelectClick={() => handleColorSelect('angry')}
                style={{
                  cursor: 'pointer',
                  border:
                    selectedColor === 'angry' ? '3px solid #76FFCE' : 'none',
                }}
              />
            </div>
          </ModalDialog>
          <div className="edit-page-edit-container">
            <div className="edit-page-input-container">
              <label htmlFor="editNickName font-title-mini">닉네임</label>
              <TextInput
                id={'editNickName'}
                value={nickName}
                onChange={setNickName}
                placeholder={'하하호호'}
                style={
                  isMobile
                    ? {
                        width: window.innerWidth - 32,
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
                htmlFor="editNickName font-title-mini"
                style={{ marginBottom: '20px' }}>
                관심사 (3개 선택)
              </label>
              <div className="category-wrapper" style={{ marginTop: '20px' }}>
                <CategoryList
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          label="수정"
          type="cta-full"
          style={
            isMobile
              ? { width: window.innerWidth - 32, marginTop: '16px' }
              : { width: '380px', marginTop: '16px' }
          }
          isDisabled={nickName.length < 2 || selectedCategories.length < 3}
          onClick={handleEditButtonClick}
        />
      </div>
    </>
  );
};

export default EditPage;
