import { useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  onIntersect: IntersectionObserverCallback;
}

const useIntersectionObserver = <T extends Element = HTMLDivElement>({
  root,
  rootMargin = '0px',
  threshold = 0,
  onIntersect,
}: UseIntersectionObserverProps) => {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(onIntersect, {
      root,
      rootMargin,
      threshold,
    });
    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, onIntersect]);

  return { targetRef };
};

export default useIntersectionObserver;
