import Button from "components/Button/Button";
import ProfileIcon from "components/ProfileIcon/ProfileIcon";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStorage } from "store/authStore";
import AnimatedLogo from "../AnimatedLogo/AnimatedLogo";
import "./header.scss";
import { mapNumberToEmotion } from "utils/index";
import useMediaQuery from "utils/useMediaQuery";
import HeaderToken from "api/HeaderToken";

type HeaderPropsType = {
  isMyPage?: boolean;
};

const Header = ({ isMyPage }: HeaderPropsType): ReactElement => {
  const isMobile = useMediaQuery("(max-width : 1200px)");
  const navigate = useNavigate();
  const { is_sign_in, setTempToken } = useAuthStorage();
  const user_profile = useAuthStorage((state) => state.user_profile);

  const handleLogoutClick = () => {
    HeaderToken.set("");
    setTempToken({ access_token: "" });
    navigate("/main");
  };

  return (
    <div className="header-background">
      <div className="header">
        <AnimatedLogo
          animationType="infinite"
          animatedWrapperWidth={isMobile ? 15 : 30}
          gap={3}
          style={isMobile ? { height: "18px" } : { height: "35px" }}
        />
        {is_sign_in ? (
          isMyPage && isMobile ? (
            <div
              className="header-logout-button-mobile"
              onClick={handleLogoutClick}
            >
              <h3 className="font-label-small">로그아웃</h3>
            </div>
          ) : (
            <button
              className="header-profile-icon-button"
              onClick={() => {
                navigate("/my");
              }}
            >
              <ProfileIcon
                type={isMobile ? "icon-small" : "icon-medium"}
                color={mapNumberToEmotion(user_profile)}
              />
            </button>
          )
        ) : (
          <Button
            label="로그인"
            type={isMobile ? "extra-small" : "small"}
            onClick={() => navigate("/auth/1")}
          ></Button>
        )}
      </div>
    </div>
  );
};

export default Header;
