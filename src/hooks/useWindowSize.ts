import { useState, useEffect } from 'react';

const getWindowWidth = () =>
  typeof window !== 'undefined' ? window.innerWidth : 0;

const useWindowSize = () => {
  const [windowWidth, setWindowWidth] = useState<number>(getWindowWidth());

  useEffect(() => {
    let frame = 0;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWindowWidth(window.innerWidth));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
};

export default useWindowSize;
