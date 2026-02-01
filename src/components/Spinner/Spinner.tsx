import { useLayoutEffect } from 'react';
import './spinner.scss';

type SpinnerProps = {
  className?: string;
  size?: number;
};

const Spinner = ({ className, size }: SpinnerProps) => {
  useLayoutEffect(() => {
    const loadingStartElement = document.getElementById('loading-start');
    const loadingEndElement = document.getElementById('loading-end');

    if (loadingStartElement) {
      loadingStartElement.innerHTML = '<p class="srOnly">로딩중...</p>';
      loadingStartElement.setAttribute('role', 'alert');
    }

    return () => {
      if (loadingStartElement) {
        loadingStartElement.innerHTML = '';
        loadingStartElement.removeAttribute('role');
      }
      if (loadingEndElement) {
        loadingEndElement.innerHTML = '<p class="srOnly">로딩완료</p>';
        setTimeout(() => {
          loadingEndElement.innerHTML = '';
        }, 1000);
      }
    };
  }, []);

  return (
    <div className={`spinner-container ${className || ''}`}>
      <div
        className="spinner"
        style={
          size
            ? { width: size, height: size, borderWidth: Math.max(2, size / 10) }
            : undefined
        }></div>
    </div>
  );
};

export default Spinner;
