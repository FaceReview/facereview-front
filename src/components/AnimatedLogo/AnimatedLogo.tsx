import { ReactElement } from 'react';
import logoR from 'assets/img/logoR.png';
import './animatedlogo.scss';

type AnimatedLogoPropType = {
  animationType: 'infinite' | 'once';
  animatedWrapperWidth: number;
  gap: number;
  style?: React.CSSProperties;
};

const AnimatedLogo = ({
  animationType,
  animatedWrapperWidth,
  gap,
  style,
}: AnimatedLogoPropType): ReactElement => {
  return (
    <div className="animated-logo-container" style={style}>
      <div
        className={`animated-bar-wrapper ${'animated-' + animationType}`}
        style={{ width: `${animatedWrapperWidth}px`, marginRight: `${gap}px` }}>
        <div className="animated-bar animated-bar-1"></div>
        <div className="animated-bar animated-bar-2"></div>
        <div className="animated-bar animated-bar-3"></div>
      </div>
      <img src={logoR} alt="FaceReview Logo" className="logoR" />
    </div>
  );
};

export default AnimatedLogo;
