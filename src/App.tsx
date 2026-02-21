import { useLayoutEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Router from './components/Router';
import { useAuthStorage } from 'store/authStore';
import HeaderToken from 'api/HeaderToken';
import { Helmet } from 'react-helmet-async';

function App() {
  const { access_token } = useAuthStorage();
  useLayoutEffect(() => {
    if (access_token) {
      HeaderToken.set(access_token);
    }

    const handleUnauthorized = () => {
      HeaderToken.set('');
      useAuthStorage.getState().setTempToken({ access_token: '' });
      // window.location.href = '/auth/1'; // Removed redirect to allow guest access
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
  }, [access_token]);

  useLayoutEffect(() => {
    const { access_token } = useAuthStorage.getState();
    const { setUserInfo } = useAuthStorage.getState();

    if (!access_token) {
      import('api/auth')
        .then(({ refreshToken, getUserName }) => {
          refreshToken()
            .then(async (res) => {
              if (res.status === 200 || res.status === 201) {
                const { access_token } = res.data;
                // Update Token
                useAuthStorage.getState().setToken({
                  access_token,
                });
                HeaderToken.set(access_token);

                // Fetch User Info
                const userRes = await getUserName();
                if (userRes.status === 200) {
                  const userData = userRes.data;
                  setUserInfo({
                    is_admin: userData.role === 'ADMIN',
                    is_sign_in: true,
                    user_id: userData.user_id,
                    user_name: userData.name,
                    user_profile: userData.profile_image_id,
                    user_tutorial: userData.is_tutorial_done ? 1 : 0,
                    access_token: access_token,
                    user_favorite_genres: userData.favorite_genres,
                    is_verify_email_done: userData.is_verify_email_done,
                  });
                }
              }
            })
            .catch(() => {
              // Failed to refresh - stay as guest
            });
        })
        .catch(() => {});
    }
  }, []);
  return (
    <div className="App">
      <Helmet>
        <title>FaceReview</title>
      </Helmet>
      <Router />
      <ToastContainer
        position="bottom-right" // 알람 위치 지정
        autoClose={3000} // 자동 off 시간
        hideProgressBar={false} // 진행시간바 숨김
        closeOnClick // 클릭으로 알람 닫기
        rtl={false} // 알림 좌우 반전
        pauseOnFocusLoss // 화면을 벗어나면 알람 정지
        draggable // 드래그 가능
        pauseOnHover // 마우스를 올리면 알람 정지
        theme="dark"
        limit={5} // 알람 개수 제한
      />
    </div>
  );
}

export default App;
