import React, { useEffect, useState } from 'react';
import TextInput from 'components/TextInput/TextInput';
import Button from 'components/Button/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import HeaderToken from 'api/HeaderToken';
import { useAuthStorage } from 'store/authStore';
import {
  changePassword,
  sendEmailVerification,
  verifyPasswordCode,
} from 'api/mypage';

const PasswordChangePage = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const navigate = useNavigate();
  const { setTempToken } = useAuthStorage();

  // 페이지 열릴 때 초기화
  useEffect(() => {
    setStep(1);
    setIsEmailSent(false);
    setVerificationCode('');
    setResetToken('');
    setNewPassword('');
    setNewPasswordConfirm('');
  }, []);

  // 이메일 발송 핸들러
  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      await sendEmailVerification();
      setIsEmailSent(true);
      toast.success('인증 코드가 발송되었습니다.');
    } catch (error) {
      toast.error('인증 코드 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  // 로그아웃 처리
  const handleLogoutClick = () => {
    HeaderToken.set('');
    setTempToken({ access_token: '' });
    navigate('/auth/1');
  };

  // 인증 코드 검증 핸들러
  const handleVerifyCodeSubmit = async () => {
    if (verificationCode.length !== 6) {
      toast.error('인증코드 6자리를 입력해주세요.');
      return;
    }

    try {
      const res = await verifyPasswordCode({ code: verificationCode });
      if (res.data?.reset_token) {
        setResetToken(res.data.reset_token);
        setStep(2); // 새 비밀번호 입력 단계로 전환
        toast.success('인증이 완료되었습니다. 새 비밀번호를 입력해주세요.');
      } else {
        toast.error('오류가 발생했습니다. 토큰을 가져올 수 없습니다.');
      }
    } catch (err) {
      toast.error('인증 코드가 올바르지 않거나 오류가 발생했습니다.');
    }
  };

  // 비밀번호 변경 요청 핸들러
  const handleChangePasswordSubmit = async () => {
    if (newPassword.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error('입력한 두 비밀번호가 서로 다릅니다.');
      return;
    }

    try {
      await changePassword({
        reset_token: resetToken,
        new_password: newPassword,
      });
      toast.success(
        '비밀번호가 성공적으로 변경되었습니다! 다시 로그인 해주세요.',
      );
      handleLogoutClick(); // 변경 성공 시 후속 조치(로그아웃) 실행
    } catch (err) {
      toast.error('비밀번호 변경 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '140px 20px 60px' /* 상단 헤더 공간 및 여유 확보 */,
        boxSizing: 'border-box',
        backgroundColor: '#15151d',
      }}>
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'transparent' /* 모달 배경 박스 제거 */,
        }}>
        {step === 1 && (
          <>
            <h3
              className="font-title-medium"
              style={{
                marginTop: '0',
                marginBottom: '24px',
                fontSize: '28px',
                fontWeight: '700',
              }}>
              비밀번호 변경 인증
            </h3>
            <p
              className="font-body-large"
              style={{
                marginTop: '0',
                marginBottom: '48px',
                color: '#A0A0A0',
                lineHeight: '1.6',
                fontSize: '16px',
                textAlign: 'center',
              }}>
              {isSending ? (
                '인증 메일 발송 중입니다...'
              ) : isEmailSent ? (
                <>
                  가입하신 이메일로 6자리 인증 코드가 발송되었습니다.
                  <br />
                  수신된 메일을 확인하여 코드를 입력해주세요.
                </>
              ) : (
                <>
                  가입된 이메일 계정으로 본인 권한을 확인합니다.
                  <br />
                  아래 버튼을 눌러 인증 코드를 발송해주세요.
                </>
              )}
            </p>
            {!isEmailSent && (
              <div style={{ width: '100%', marginTop: '20px' }}>
                <Button
                  label="인증코드 발송"
                  variant="small"
                  onClick={handleSendEmail}
                  disabled={isSending}
                  style={{ width: '100%', padding: '16px 0', fontSize: '16px' }}
                />
              </div>
            )}
            {isEmailSent && (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  alignItems: 'center',
                  marginTop: '12px',
                }}>
                <TextInput
                  id="passwordVerificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="6자리 코드"
                  maxLength={6}
                  aria-label="6자리 인증 코드"
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    letterSpacing: '12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid #4B4B5C',
                    borderRadius: '0',
                    padding: '16px 0',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                />
                <Button
                  label="인증 확인"
                  variant="small"
                  onClick={handleVerifyCodeSubmit}
                  disabled={isSending || verificationCode.length !== 6}
                  style={{ width: '100%', padding: '16px 0', fontSize: '16px' }}
                />
              </div>
            )}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                marginTop: '24px',
              }}>
              <Button
                label="취소하고 돌아가기"
                variant="small-outline"
                onClick={() => navigate('/my')}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  fontSize: '16px',
                  color: '#E0E0E0',
                  borderColor: '#888',
                }}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3
              className="font-title-medium"
              style={{
                marginTop: '0',
                marginBottom: '24px',
                fontSize: '28px',
                fontWeight: '700',
              }}>
              새 비밀번호 설정
            </h3>
            <p
              className="font-body-large"
              style={{
                marginTop: '0',
                marginBottom: '48px',
                color: '#A0A0A0',
                lineHeight: '1.6',
                fontSize: '16px',
                textAlign: 'center',
              }}>
              새롭게 사용할 비밀번호를 입력해주세요.
              <br />
              최소 8자 이상의 안전한 암호를 권장합니다.
            </p>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                alignItems: 'center',
              }}>
              <TextInput
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                aria-label="새 비밀번호 입력"
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid #4B4B5C',
                  borderRadius: '0',
                  padding: '16px 8px',
                  fontSize: '18px',
                  color: '#FFFFFF',
                }}
              />
              <TextInput
                id="newPasswordConfirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="새 비밀번호 다시 입력"
                aria-label="새 비밀번호 확인"
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid #4B4B5C',
                  borderRadius: '0',
                  padding: '16px 8px',
                  fontSize: '18px',
                  color: '#FFFFFF',
                }}
              />
              <Button
                label="비밀번호 변경"
                variant="small"
                onClick={handleChangePasswordSubmit}
                disabled={!newPassword || !newPasswordConfirm}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  fontSize: '16px',
                  marginTop: '16px',
                }}
              />
              <Button
                label="취소하고 돌아가기"
                variant="small-outline"
                onClick={() => navigate('/my')}
                style={{
                  width: '100%',
                  padding: '16px 0',
                  fontSize: '16px',
                  color: '#888',
                  borderColor: '#444',
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordChangePage;
