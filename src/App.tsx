import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Router from './components/Router';
import { useAuthStorage } from 'store/authStore';
import HeaderToken from 'api/HeaderToken';
import { refreshToken, getUserName } from 'api/auth';
import { Helmet } from 'react-helmet-async';

function App() {
  const access_token = useAuthStorage((state) => state.access_token);

  useEffect(() => {
    if (access_token) {
      HeaderToken.set(access_token);
    }

    const handleUnauthorized = () => {
      HeaderToken.set(null);
      useAuthStorage.getState().clearAuth();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [access_token]);

  useEffect(() => {
    const { access_token } = useAuthStorage.getState();
    const { setUserInfo } = useAuthStorage.getState();

    if (access_token) return;

    refreshToken()
      .then(async (res) => {
        if (res.status === 200 || res.status === 201) {
          const { access_token } = res.data;
          useAuthStorage.getState().setToken({ access_token });
          HeaderToken.set(access_token);

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
  }, []);

  return (
    <div className="App">
      <Helmet>
        <title>FaceReview</title>
      </Helmet>
      <Router />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={5}
      />
    </div>
  );
}

export default App;
