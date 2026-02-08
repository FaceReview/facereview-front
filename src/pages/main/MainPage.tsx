import { ReactElement, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useMediaQuery from 'utils/useMediaQuery';
import TextInput from 'components/TextInput/TextInput';
import SearchResultsSection from './SearchResultsSection';
import HomeContentSection from './HomeContentSection';
import './mainpage.scss';

const MainPage = (): ReactElement => {
  const isMobile = useMediaQuery('(max-width: 1200px)');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [keyword, setKeyword] = useState(searchQuery || '');

  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setKeyword(searchQuery || '');
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchParams({ q: keyword });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="main-page-container">
      <div
        className="search-section"
        style={{
          marginBottom: '56px',
          padding: isMobile ? '0' : '0',
          display: 'flex',
          justifyContent: 'flex-start',
          marginTop: isMobile ? '0px' : '0px',
        }}>
        <form
          onSubmit={handleSearch}
          style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
          <TextInput
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="찾고 싶은 영상을 검색해보세요"
            variant="default"
            style={{
              width: '100%',
              borderRadius: '100px',
              paddingRight: '50px',
              height: '52px',
              fontSize: '16px',
              border: '1px solid #32323f',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a0a1ac"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      </div>

      {searchQuery ? (
        <SearchResultsSection query={searchQuery} />
      ) : (
        <HomeContentSection />
      )}
    </div>
  );
};

export default MainPage;
