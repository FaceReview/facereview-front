import AnimatedLogo from 'components/AnimatedLogo/AnimatedLogo';
import Button from 'components/Button/Button';
import StepIndicator from 'components/StepIndicator/StepIndicator';
import TextInput from 'components/TextInput/TextInput';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { checkEmail, getUserName, signIn, signUp } from 'api/auth';
import HeaderToken from 'api/HeaderToken';
import CategoryList from 'components/CategoryList/CategoryList';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStorage } from 'store/authStore';
import { CategoryType } from 'types';
import './authpage.scss';

const AlertMessages = {
  emailInvalid: '올바르지 않은 이메일 형식이에요',
  passwordInvalid: '최소 8자의 비밀번호를 입력해주세요',
  confirmPasswordInvalid: '동일한 비밀번호를 입력해주세요',
  nicknameInvalid: '최소 2자의 닉네임을 입력해주세요',
};
const AuthPage = () => {
  const navigate = useNavigate();
  const { step } = useParams();
  const currentStep = +(step || 1);
  const { setUserInfo } = useAuthStorage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [emailAlertMessage, setEmailAlertMessage] = useState('');
  const [passwordAlertMessage, setPasswordAlertMessage] = useState('');
  const [confirmPasswordAlertMessage, setConfirmPasswordAlertMessage] =
    useState('');
  const [nicknameAlertMessage, setNicknameAlertMessage] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const [isSingInSuccess, setIsSingInSuccess] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentStep === 1) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    } else if (currentStep === 2) {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    } else if (currentStep === 3) {
      setTimeout(() => nicknameInputRef.current?.focus(), 100);
    }
  }, [currentStep]);

  const validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
  };

  const handleEmailChange = (email: string) => {
    setEmail(email);
    if (validateEmail(email) === null) {
      setEmailAlertMessage(AlertMessages.emailInvalid);
      navigate('/auth/1');
      return;
    }
    setEmailAlertMessage(' ');
  };

  const handlePasswordChange = (password: string) => {
    setPassword(password);
    if (password.length < 8) {
      setPasswordAlertMessage(AlertMessages.passwordInvalid);
      return;
    }
    setPasswordAlertMessage(' ');
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setConfirmPassword(confirmPassword);
    if (password !== confirmPassword) {
      setConfirmPasswordAlertMessage(AlertMessages.confirmPasswordInvalid);
      return;
    }
    setConfirmPasswordAlertMessage(' ');
  };

  const handleNicknameChange = (nickname: string) => {
    setNickname(nickname);
    if (nickname.length < 2) {
      setNicknameAlertMessage(AlertMessages.nicknameInvalid);
      return;
    }
    setNicknameAlertMessage(' ');
  };

  const handleSubmitButtonClick = () => {
    if (currentStep === 1) {
      if (email !== '' && emailAlertMessage === ' ') {
        checkEmail({ email: email }).then((res) => {
          // V2 API: res.data.is_duplicate determines if user exists
          const isRegistered = res.data.is_duplicate;

          if (!isRegistered) {
            toast.info('회원가입을 도와드릴게요', {
              toastId: 'need signUp',
            });
          }
          setIsSignIn(isRegistered);
          navigate('/auth/2');
        });
      }
      return;
    }
    if (currentStep === 2) {
      if (isSignIn) {
        if (password.length >= 8) {
          signIn({ email: email, password: password })
            .then(async (res) => {
              // V2 API: signIn returns tokens only. Need to fetch user profile.
              if (res.status === 200) {
                const { access_token, refresh_token } = res.data;
                HeaderToken.set(access_token);

                // Fetch User Info
                const userRes = await getUserName();

                if (userRes.status === 200) {
                  const userData = userRes.data;
                  setIsSingInSuccess(true);

                  setUserInfo({
                    is_admin: userData.role === 'ADMIN',
                    is_sign_in: true,
                    user_id: userData.user_id,
                    user_name: userData.name,
                    user_profile: userData.profile_image_id,
                    user_tutorial: userData.is_tutorial_done ? 1 : 0, // Converting boolean to number if store expects number
                    access_token: access_token,
                    refresh_token: refresh_token,
                    user_favorite_genres: userData.favorite_genres,
                  });

                  setTimeout(() => {
                    if (userData.is_tutorial_done) {
                      navigate('/');
                      return;
                    }
                    navigate('/tutorial/1');
                  }, 400);
                }
              }
            })
            .catch(() => {
              toast.error('로그인 실패', { toastId: 'signIn fail' });
            });
        }
        return;
      }
      if (password.length >= 8 && password === confirmPassword) {
        navigate('/auth/3');
      }
    }
    if (currentStep === 3 && !isSignIn) {
      signUp({
        email: email,
        password: password,
        name: nickname,
        favorite_genres: categories,
      }).then((res) => {
        if (res.status === 201 || res.status === 200) {
          toast.success('가입되었어요', { toastId: 'signUp complete' });
          // Auto login logic could be added here similar to signIn if desired
          navigate('/auth');
        }
      });
    }
  };

  const getConfirmButtonLabel = () => {
    if (currentStep === 2 && isSignIn) {
      return '로그인';
    }
    if (currentStep === 3 && !isSignIn) {
      return '회원가입';
    }
    return '다음';
  };

  const isConfirmButtonVisible = () => {
    if (currentStep === 1 && emailAlertMessage === ' ') {
      return true;
    }
    if (currentStep === 2 && isSignIn && passwordAlertMessage === ' ') {
      return true;
    }
    if (
      currentStep === 2 &&
      !isSignIn &&
      passwordAlertMessage === ' ' &&
      confirmPasswordAlertMessage === ' '
    ) {
      return true;
    }
    if (
      currentStep === 3 &&
      !isSignIn &&
      nicknameAlertMessage === ' ' &&
      categoryAlertMessage === ' '
    ) {
      return true;
    }
  };

  const getCategoryAlertMessage = () => {
    return ' ';
  };
  const categoryAlertMessage = getCategoryAlertMessage();

  return (
    <>
      <div className="auth-container">
        <StepIndicator step={isSingInSuccess ? 3 : currentStep} maxStep={3} />

        <div className="logo-wrapper">
          <Link to="/">
            <AnimatedLogo
              animationType="once"
              animatedWrapperWidth={73}
              gap={7}
              style={{ height: '84px' }}
            />
          </Link>
        </div>

        <form
          className="input-container"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitButtonClick();
          }}>
          {currentStep !== 3 ? (
            <div className="input-item-container">
              <label
                htmlFor="authEmail"
                className="input-label font-title-mini">
                이메일 주소
              </label>
              <TextInput
                ref={emailInputRef}
                id="authEmail"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="ex) haha@facereview.com"
                autoFocus={true}
                disabled={currentStep > 1}
              />
              <p className="input-alert-message font-body-large">
                {emailAlertMessage}
              </p>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="input-item-container">
              <label
                htmlFor="authPassword"
                className="input-label font-title-mini">
                비밀번호
              </label>
              <TextInput
                ref={passwordInputRef}
                id="authPassword"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="최소 8자의 비밀번호를 입력해주세요"
                maxLength={60}
              />
              <p className="input-alert-message font-body-large">
                {passwordAlertMessage}
              </p>
            </div>
          ) : null}
          {currentStep === 2 && !isSignIn ? (
            <div className="input-item-container">
              <label
                htmlFor="authPasswordConfirm"
                className="input-label font-title-mini">
                비밀번호 확인
              </label>
              <TextInput
                id="authPasswordConfirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="비밀번호를 다시 한 번 입력해주세요"
                maxLength={60}
              />
              <p className="input-alert-message font-body-large">
                {confirmPasswordAlertMessage}
              </p>
            </div>
          ) : null}
          {currentStep === 3 && !isSignIn ? (
            <>
              <div className="input-item-container">
                <label
                  htmlFor="authNickname"
                  className="input-label font-title-mini">
                  닉네임
                </label>
                <TextInput
                  ref={nicknameInputRef}
                  id="authNickname"
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  placeholder="최소 2자의 닉네임을 입력해주세요"
                  maxLength={60}
                />
                <p className="input-alert-message font-body-large">
                  {nicknameAlertMessage}
                </p>
              </div>
              <div className="input-item-container">
                <label
                  htmlFor="authNickname"
                  className="input-label font-title-mini">
                  관심 카테고리 (선택)
                </label>
                <div className="category-wrapper">
                  <CategoryList
                    selected={categories}
                    onChange={setCategories}
                  />
                </div>
                <p className="input-alert-message font-body-large">
                  {categoryAlertMessage}
                </p>
              </div>
            </>
          ) : null}
          {isConfirmButtonVisible() ? (
            <Button
              label={getConfirmButtonLabel()}
              variant="cta-full"
              type="submit"
              style={{ marginTop: '48px' }}
              disabled={!isConfirmButtonVisible()}
            />
          ) : null}
        </form>
      </div>
    </>
  );
};

export default AuthPage;
