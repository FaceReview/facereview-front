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
      loadingStartElement.textContent = '로딩중...';
      loadingStartElement.setAttribute('role', 'alert');
    }

    return () => {
      if (loadingStartElement) {
        loadingStartElement.textContent = '';
        loadingStartElement.removeAttribute('role');
      }
      if (loadingEndElement) {
        loadingEndElement.textContent = '로딩완료';
        setTimeout(() => {
          loadingEndElement.textContent = '';
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
