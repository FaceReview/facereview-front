import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import Button from 'components/Button/Button';
import './notfoundpage.scss';

const NotFoundPage = (): ReactElement => {
  return (
    <div className="not-found-container">
      <h1 className="not-found-code font-title-large">404</h1>
      <p className="not-found-text font-body-large">
        찾으시는 페이지가 없어요.
      </p>
      <Link to="/">
        <Button label="홈으로 돌아가기" variant="cta-fixed" />
      </Link>
    </div>
  );
};

export default NotFoundPage;
