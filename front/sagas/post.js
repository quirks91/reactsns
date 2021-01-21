import { all, put, takeLatest, fork, throttle, call } from 'redux-saga/effects';
import axios from 'axios';

import { 
  ADD_POST_REQUEST, ADD_POST_SUCCESS, ADD_POST_FAILURE, 
  ADD_COMMENT_REQUEST, ADD_COMMENT_SUCCESS, ADD_COMMENT_FAILURE,
  REMOVE_POST_REQUEST, REMOVE_POST_SUCCESS, REMOVE_POST_FAILURE,
  LOAD_POSTS_REQUEST, LOAD_POSTS_FAILURE, LOAD_POSTS_SUCCESS, 
  LIKE_POST_REQUEST, LIKE_POST_SUCCESS, LIKE_POST_FAILURE,
  UNLIKE_POST_REQUEST, UNLIKE_POST_SUCCESS, UNLIKE_POST_FAILURE,
  UPLOAD_IMAGES_REQUEST, UPLOAD_IMAGES_SUCCESS, UPLOAD_IMAGES_FAILURE,
  RETWEET_REQUEST, RETWEET_SUCCESS, RETWEET_FAILURE,
  LOAD_POST_REQUEST, LOAD_POST_SUCCESS, LOAD_POST_FAILURE,
  LOAD_USER_POSTS_REQUEST, LOAD_USER_POSTS_SUCCESS, LOAD_USER_POSTS_FAILURE,
  LOAD_HASHTAG_POSTS_REQUEST, LOAD_HASHTAG_POSTS_SUCCESS, LOAD_HASHTAG_POSTS_FAILURE,
  UPDATE_POST_REQUEST, UPDATE_POST_SUCCESS, UPDATE_POST_FAILURE,
} from '../reducers/post';

import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from '../reducers/user';

function retweetAPI(data) {
  return axios.post(`/post/${data}/retweet`);
}

function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data);
    yield put({
      type: RETWEET_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: RETWEET_FAILURE,
      error: err.response.data,
    });
  }
}

function uploadImageAPI(data) {
  return axios.post('/post/images', data); // FormData는 data그대로 들어가면된다.
}

function* uploadImage(action) {
  try {
    const result = yield call(uploadImageAPI, action.data);
    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UPLOAD_IMAGES_FAILURE,
      error: err.response.data,
    });
  }
}

function likePostAPI(data) {
  return axios.patch(`/post/${data}/like`);
}

function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    yield put({
      type: LIKE_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LIKE_POST_FAILURE,
      error: err.response.data,
    });
  }
}

function unlikePostAPI(data) {
  return axios.delete(`/post/${data}/like`);
}

function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    yield put({
      type: UNLIKE_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UNLIKE_POST_FAILURE,
      error: err.response.data,
    });
  }
}

function loadPostAPI(data) {
  return axios.get(`/post/${data}`);
}

function* loadPost(action) {
  try {
    const result = yield call(loadPostAPI, action.data);
    yield put({
      type: LOAD_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_POST_FAILURE,
      data: err.response.data,
    });
  }
}

function loadHashtagPostsAPI(data, lastId) {
  return axios.get(`/hashtag/${encodeURIComponent(data)}?lastId=${lastId || 0}`);
}

function* loadHashtagPosts(action) {
  try {
    const result = yield call(loadHashtagPostsAPI, action.data, action.lastId);
    yield put({
      type: LOAD_HASHTAG_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_HASHTAG_POSTS_FAILURE,
      data: err.response.data,
    });
  }
}

function loadUserPostsAPI(data, lastId) {
  return axios.get(`/user/${data}/posts?lastId=${lastId || 0}`);
}

function* loadUserPosts(action) {
  try {
    const result = yield call(loadUserPostsAPI, action.data, action.lastId);
    yield put({
      type: LOAD_USER_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_USER_POSTS_FAILURE,
      data: err.response.data,
    });
  }
}

function loadPostsAPI(lastId) {
  return axios.get(`/posts?lastId=${lastId || 0}`);
}

function* loadPosts(action) {
  try {
    const result = yield call(loadPostsAPI, action.lastId);
    yield put({
      type: LOAD_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_POSTS_FAILURE,
      error: err.response.data,
    });
  }
}

function addPostAPI(data) { // 3) 전달 받아서
  return axios.post('/post', data); // 4) 여기로 온다.
}

function* addPost(action) { // 1) 액션에서
  try {
    const result = yield call(addPostAPI, action.data); // 2) 데이터 꺼내서
    yield put({
      type: ADD_POST_SUCCESS,
      data: result.data,
    });
    yield put({
      type: ADD_POST_TO_ME,
      data: result.data.id,
    });
  } catch (err) {
    yield put({
      type: ADD_POST_FAILURE,
      error: err.response.data,
    });
  }
}

function updatePostAPI(data) { // 3) 전달 받아서
  return axios.patch(`/post/${data.PostId}`, data); // 4) 여기로 온다.
}

function* updatePost(action) { // 1) 액션에서
  try {
    const result = yield call(updatePostAPI, action.data); // 2) 데이터 꺼내서
    yield put({
      type: UPDATE_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: UPDATE_POST_FAILURE,
      error: err.response.data,
    });
  }
}

function removePostAPI(data) { // 3) 전달 받아서
  return axios.delete(`/post/${data}`); // 4) 여기로 온다.
}

function* removePost(action) { // 1) 액션에서
  try {
    const result = yield call(removePostAPI, action.data); // 2) 데이터 꺼내서
    yield put({
      type: REMOVE_POST_SUCCESS,
      data: result.data,
    });
    yield put({
      type: REMOVE_POST_OF_ME,
      data: action.data,
    });
  } catch (err) {
    yield put({
      type: REMOVE_POST_FAILURE,
      error: err.response.data,
    });
  }
}

function addCommentAPI(data) { 
  return axios.post(`/post/${data.postId}/comment`, data); // POST /post/1/comment
}

function* addComment(action) { 
  try {
    const result = yield call(addCommentAPI, action.data); 
    yield put({
      type: ADD_COMMENT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({ // put = dispatch
      type: ADD_COMMENT_FAILURE,
      error: err.response.data,
    });
  }
}
// debounce: 호출되고 일정 시간이 지나야만 실제로 실행되고 시간이 지나기전에 재호출되면 이전게 취소된다.
// take: 로그인이란 액션이 실행될 때 까지 기다린다 , 1번 실행
// takeEvery: 누를 떄 마다 실행 100번 누르면 100번

// takeLatest는 모두 호출하고 이전게 완료되기 전에 다음게 호출되면 이전것은 취소된다. 실수로 두번 클릭되는 걸 방지하기 위해 많이 사용
// 요청 >> 은 취소가 안되기 때문에 backend에서 처리를 해줘야함, 응답은 최근 응답을 제외하고 취소된다.

function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}

function* watchUploadImage() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImage);
}

function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function* watchLoadPosts() {
  yield throttle(3000, LOAD_POSTS_REQUEST, loadPosts);
}

function* watchHashtagPosts() {
  yield throttle(3000, LOAD_HASHTAG_POSTS_REQUEST, loadHashtagPosts);
}

function* watchUserPosts() {
  yield throttle(3000, LOAD_USER_POSTS_REQUEST, loadUserPosts);
}

function* watchLoadPost() {
  yield takeLatest(LOAD_POST_REQUEST, loadPost);
}

function* watchUpdatePost() {
  yield takeLatest(UPDATE_POST_REQUEST, updatePost);
}

function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchRemovePost() {
  yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

export default function* postSaga() {
  yield all([
    fork(watchUpdatePost),
    fork(watchRetweet),
    fork(watchUploadImage),
    fork(watchLikePost),
    fork(watchUnlikePost),
    fork(watchLoadPost),
    fork(watchUserPosts),
    fork(watchHashtagPosts),
    fork(watchLoadPosts),
    fork(watchAddPost),
    fork(watchRemovePost),
    fork(watchAddComment),
  ]);
}
