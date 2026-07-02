import { ReactElement } from 'react';
import UploadButtonImage from 'assets/img/uploadButton.png';

import './uploadbutton.scss';

type UploadButtonPropsType = {
  style?: React.CSSProperties;
  isDisabled?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
};

const UploadButton = ({
  style,
  isDisabled,
  onClick,
  ...restProps
}: UploadButtonPropsType): ReactElement => {
  return (
    <button
      type="button"
      className={`upload-button ${isDisabled ? 'disabled' : ''}`}
      style={style}
      disabled={isDisabled}
      onClick={onClick}
      {...restProps}>
      <div className="dim"></div>
      <img
        className="upload-button-image"
        src={UploadButtonImage}
        alt=""
        aria-hidden="true"
      />
    </button>
  );
};

export default UploadButton;
