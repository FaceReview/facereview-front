import { ReactElement, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import YouTube from 'react-youtube';
import { submitNewVideo } from 'api/admin';
import { getRequestedVideoList } from 'api/request';
import { getDataFromYoutube } from 'api/youtube';
import Button from 'components/Button/Button';
import CategoryList from 'components/CategoryList/CategoryList';
import {
  CategoryType,
  RegisterVideoDataType,
  ReqeustedVideoType,
} from 'types/index';
import { getTimeArrFromDuration } from 'utils/index';
import { Options } from 'youtube-player/dist/types';

import './adminpage.scss';

const opts: Options = {
  width: 560,
  height: 316,
  playerVars: {
    color: 'white',
    rel: 0,
    origin: window.location.origin,
  },
};

const MainPage = (): ReactElement => {
  const [draftRequestedVideoList, setDraftRequestedVideoList] = useState<
    ReqeustedVideoType[]
  >([]);
  const [currentSelectedUrl, setCurrentSelectedUrl] = useState('');
  const [currentVideoData, setCurrentVideoData] =
    useState<RegisterVideoDataType>({
      youtube_url: '',
      youtube_title: '',
      youtube_channel: '',
      youtube_length_hour: 0,
      youtube_length_minute: 0,
      youtube_length_second: 0,
      youtube_category: '',
    });
  const [currentVideoCategoryList, setCurrentVideoCategoryList] = useState<
    CategoryType[]
  >([]);

  const handleSubmitClick = () => {
    submitNewVideo(currentVideoData)
      .then(() => {
        getRequestedVideoList()
          .then((res) => {
            setCurrentVideoCategoryList([]);
            setCurrentSelectedUrl(res[0].url);
            setDraftRequestedVideoList(res);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getDataFromYoutube({ youtube_url: currentSelectedUrl })
      .then((res) => {
        const [hour, minute, second] = getTimeArrFromDuration(
          res.items[0].contentDetails.duration
        );
        const temp = {
          youtube_url: res.items[0].id,
          youtube_title: res.items[0].snippet.title,
          youtube_channel: res.items[0].snippet.channelTitle,
          youtube_length_hour: hour,
          youtube_length_minute: minute,
          youtube_length_second: second,
          youtube_category: '',
        };
        setCurrentVideoData(temp);
      })
      .catch(() => {});
  }, [currentSelectedUrl]);

  const handleCategoryChange = (newCategories: CategoryType[]) => {
    setCurrentVideoCategoryList(newCategories);
    setCurrentVideoData((prev) => ({
      ...prev,
      youtube_category: newCategories[0] || '',
    }));
  };

  useEffect(() => {
    getRequestedVideoList()
      .then((res) => {
        setDraftRequestedVideoList(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="admin-page-container">
      <div className="hot-contents-container">
        <h2 className="title font-title-large">영상추가 요청 관리</h2>
        <h4 className="subtitle font-title-small">
          리뷰어들이 추가요청한 영상들을 관리해주세요.
        </h4>
        <div className="selected-video-container">
          <div className="left-container">
            <YouTube
              videoId={currentSelectedUrl}
              style={{ marginBottom: '20px' }} // defaults -> {}
              opts={opts} // defaults -> {}
            />
          </div>
          <div className="right-container">
            <div className="input-container">
              <CategoryList
                selected={currentVideoCategoryList}
                onChange={handleCategoryChange}
                maxSelection={1}
              />
            </div>
            <Button
              label={'등록하기'}
              type={'cta-full'}
              onClick={handleSubmitClick}
              isDisabled={
                !currentVideoData.youtube_url ||
                !currentVideoCategoryList.length
              }
              style={{ marginTop: '24px' }}
            />
          </div>
        </div>
        <div className="request-video-container">
          {draftRequestedVideoList.map((d) => (
            <div
              key={uuidv4()}
              className={`draft-url-item ${
                d.url === currentSelectedUrl ? 'active' : null
              }`}
              onClick={() => setCurrentSelectedUrl(d.url)}>
              <p className="font-label-medium draft-url-text">{d.url}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
