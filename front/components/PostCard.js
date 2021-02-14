import React, { useState, useCallback }from 'react';
import { Button, Card, Popover, Avatar, List, Comment } from 'antd';
import { RetweetOutlined, HeartOutlined, EllipsisOutlined, HeartTwoTone } from '@ant-design/icons';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import PostImages from './PostImages';
import CommentForm from './CommentForm';
import PostCardContent from './PostCardContent';
import { REMOVE_POST_REQUEST, LIKE_POST_REQUEST, UNLIKE_POST_REQUEST, RETWEET_REQUEST, UPDATE_POST_REQUEST } from '../reducers/post';
import FollowButton from './FollowButton';

moment.locale('ko'); // 기본이 영어라 한글로 바꿔준다

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { removePostLoading } = useSelector((state) => state.post);
  const id = useSelector((state) => state.user.me?.id );
  const liked = post.Likers.find((v) => v.id === id);
  const [editMode, setEditMode] = useState(false);

  const onClickUpdate = useCallback(() => {
    setEditMode(true);
  }, []);

  const onCancelUpdate = useCallback(() => {
    setEditMode(false);
  }, []);

  const onChangePost = useCallback((editText) => () => {
    dispatch({
      type: UPDATE_POST_REQUEST,
      data: {
        PostId: post.id,
        content: editText,
      },
    });
  }, [post]);
  
  const onLike = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다.');
    }
    return dispatch({
      type: LIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);

  const onUnLike = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다');
    }
    return dispatch({
      type: UNLIKE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);

  const onRemovePost = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다');
    }
    return dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id,
    });
  }, [id]);

  const onRetweet = useCallback(() => {
    if (!id) {
      return alert('로그인이 필요합니다');
    }
    return dispatch({
      type: RETWEET_REQUEST,
      data: post.id,
    });
  }, [id]);

  return (
    <div style={{ marginBottom: 10 }}>
      <Card 
        cover={post.Images[0] && <PostImages images={post.Images} />}
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,
          liked
            ? <HeartTwoTone twoToneColor="#eb2f96" key="heart" onClick={onUnLike} />
            : <HeartOutlined onClick={onLike} key="heart" />,
          <Popover
            key="more" 
            content={(
              <Button.Group>
                {id && post.User.id === id && (
                  <>
                    {!post.RetweetId && <Button onClick={onClickUpdate}>수정</Button>}
                    <Button type="danger" loading={removePostLoading} onClick={onRemovePost}>삭제</Button>
                  </>
                )}
              </Button.Group>
        )}>
            <EllipsisOutlined />
          </Popover>,
        ]}
        title={post.RetweetId ? `${post.User.nickname}님이 리트윗하셨습니다.` : null}
        extra={id && <FollowButton post={post} />}
      >
        {/* 리트윗 부분 */}
        {post.RetweetId && post.Retweet
          ? (
            <Card cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />}>
              <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={<Link href={`/user/${post.Retweet.User.id}`}><a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a></Link>}
                title={post.Retweet.User.nickname}
                description={(
                  <PostCardContent 
                    postData={post.Retweet.content} 
                    onChangePost={onChangePost} 
                    onCancelUpdate={onCancelUpdate} 
                  />
                )}
              />
            </Card>
          )
          : (
            <>
              <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={<Link href={`/user/${post.User.id}`}><a><Avatar>{post.User.nickname[0]}</Avatar></a></Link>}
                title={post.User.nickname}
                description={(
                  <PostCardContent 
                    editMode={editMode} 
                    onCancelUpdate={onCancelUpdate} 
                    onChangePost={onChangePost} 
                    postData={post.content}
                  />
)}
                 // editMode는 true면 textarea를 보여주고 false면 기존 게시글을 보여준다
              /> 
            </>
          )}
      </Card>
      {/* 댓글 부분 */}
      <div>
        <CommentForm post={post} />
        <List
          header={post.Comments? `${post.Comments.length}개의 댓글` : '0개의 댓글'}
          itemLayout="horizontal"
          dataSource={post.Comments}
          renderItem={(item) => (
            <li>
              <Comment
                author={item.User.nickname}
                avatar={(
                  <Link href={`/user/${item.User.id}`}><a>
                    <Avatar>
                      {item.User.nickname[0]}
                    </Avatar></a></Link>
                )}
                content={item.content}
              />
            </li>
          )}
        />
      </div>
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object),
    Likers: PropTypes.arrayOf(PropTypes.object),
    RetweetId: PropTypes.number,
    Retweet: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
};

export default PostCard;
