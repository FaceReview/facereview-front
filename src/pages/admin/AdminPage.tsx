import { ReactElement, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import YouTube from 'react-youtube';
import { approveVideoRequest } from 'api/admin';
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
      video_url: '',
      title: '',
      channel_name: '',
      length_hour: 0,
      length_minute: 0,
      length_second: 0,
      category: '',
    });
  const [currentVideoCategoryList, setCurrentVideoCategoryList] = useState<
    CategoryType[]
  >([]);

  const handleSubmitClick = () => {
    // Find the request ID associated with the current URL
    const selectedRequest = draftRequestedVideoList.find(
      (d) => d.youtube_url === currentSelectedUrl,
    );

    if (!selectedRequest) {
      console.error('Request not found');
      return;
    }

    approveVideoRequest({
      request_id: selectedRequest.request_id,
      category: currentVideoCategoryList[0],
    })
      .then(() => {
        getRequestedVideoList()
          .then((res) => {
            setCurrentVideoCategoryList([]);
            if (res.length > 0) {
              setCurrentSelectedUrl(res[0].youtube_url);
            } else {
              setCurrentSelectedUrl('');
            }
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
    if (!currentSelectedUrl) return;

    getDataFromYoutube({ youtube_url: currentSelectedUrl })
      .then((res) => {
        if (!res.items || res.items.length === 0) return;

        const [hour, minute, second] = getTimeArrFromDuration(
          res.items[0].contentDetails.duration,
        );
        const temp = {
          video_url: res.items[0].id,
          title: res.items[0].snippet.title,
          channel_name: res.items[0].snippet.channelTitle,
          length_hour: hour,
          length_minute: minute,
          length_second: second,
          category: '',
        };
        setCurrentVideoData(temp);
      })
      .catch(() => {});
  }, [currentSelectedUrl]);

  const handleCategoryChange = (newCategories: CategoryType[]) => {
    setCurrentVideoCategoryList(newCategories);
    setCurrentVideoData((prev) => ({
      ...prev,
      category: newCategories[0] || '',
    }));
  };

  useEffect(() => {
    getRequestedVideoList()
      .then((res) => {
        setDraftRequestedVideoList(res);
        if (res.length > 0) {
          setCurrentSelectedUrl(res[0].youtube_url);
        }
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
            {currentSelectedUrl ? (
              <YouTube
                videoId={currentSelectedUrl}
                style={{ marginBottom: '20px' }} // defaults -> {}
                opts={opts} // defaults -> {}
              />
            ) : (
              <div
                style={{
                  width: '560px',
                  height: '316px',
                  backgroundColor: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <p>영상을 선택해주세요</p>
              </div>
            )}
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
              variant={'cta-full'}
              onClick={handleSubmitClick}
              disabled={
                !currentVideoData.video_url || !currentVideoCategoryList.length
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
                d.youtube_url === currentSelectedUrl ? 'active' : null
              }`}
              onClick={() => setCurrentSelectedUrl(d.youtube_url)}>
              <p className="font-label-medium draft-url-text">
                {d.youtube_url}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
