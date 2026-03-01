import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'api/auth';
import HeaderToken from 'api/HeaderToken';
import { useAuthStorage } from 'store/authStore';

export const useLogout = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStorage();

  const handleLogout = useCallback(
    async (redirectPath: string = '/main') => {
      try {
        await signOut();
      } catch (error) {
        console.error('Logout API call failed:', error);
      } finally {
        // API 요청 결과와 무관하게 클라이언트 상태 초기화 보장
        HeaderToken.set('');
        clearAuth();
        navigate(redirectPath);
      }
    },
    [clearAuth, navigate],
  );

  return { handleLogout };
};
