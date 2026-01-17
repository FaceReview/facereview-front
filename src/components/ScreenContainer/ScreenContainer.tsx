import { ReactElement, useLayoutEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStorage } from 'store/authStore';
import Header from '../Header/Header';

import './screencontainer.scss';

const ScreenContainer = ({
  headerShown,
  isAdmin = false,
  isSignIn = false,
}: {
  headerShown: boolean;
  isAdmin?: boolean;
  isSignIn?: boolean;
}): ReactElement => {
  const { is_sign_in, is_admin } = useAuthStorage();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (isAdmin && !is_admin) {
      toast.error('관리자 권한이 없어요', { toastId: 'not admin' });
      navigate('/');
    }
    if (isSignIn && !is_sign_in) {
      toast.error('로그인을 해주세요', { toastId: 'need signin' });
      navigate('/auth/1');
    }
  });

  return (
    <div className="screen-container">
      {headerShown ? <Header isMyPage={isSignIn} /> : null}
      <Outlet />
    </div>
  );
};

export default ScreenContainer;
