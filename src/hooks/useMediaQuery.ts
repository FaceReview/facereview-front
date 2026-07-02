import { useEffect, useState } from 'react';

const useMediaQuery = (query: string) => {
  const getMatches = (q: string): boolean =>
    typeof window !== 'undefined' ? window.matchMedia(q).matches : false;

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
