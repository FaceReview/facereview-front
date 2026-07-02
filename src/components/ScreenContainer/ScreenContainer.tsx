import { ReactElement, useEffect } from 'react';
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
}): ReactElement | null => {
  const is_sign_in = useAuthStorage((s) => s.is_sign_in);
  const is_admin = useAuthStorage((s) => s.is_admin);
  const navigate = useNavigate();

  const denied = (isAdmin && !is_admin) || (isSignIn && !is_sign_in);

  useEffect(() => {
    if (isAdmin && !is_admin) {
      toast.error('관리자 권한이 없어요', { toastId: 'not admin' });
      navigate('/');
    } else if (isSignIn && !is_sign_in) {
      toast.error('로그인을 해주세요', { toastId: 'need signin' });
      navigate('/auth/1');
    }
  }, [isAdmin, isSignIn, is_admin, is_sign_in, navigate]);

  if (denied) return null;

  return (
    <div className="screen-container">
      {headerShown ? <Header isMyPage={isSignIn} /> : null}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ScreenContainer;
