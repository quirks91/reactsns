import { all, put, takeLatest, fork, call } from 'redux-saga/effects';
import axios from 'axios';

import { 
  LOG_IN_SUCCESS, LOG_IN_FAILURE, LOG_IN_REQUEST, 
  LOG_OUT_FAILURE, LOG_OUT_REQUEST, LOG_OUT_SUCCESS,
  SIGN_UP_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE,
  FOLLOW_REQUEST, FOLLOW_FAILURE, FOLLOW_SUCCESS,
  UNFOLLOW_FAILURE, UNFOLLOW_REQUEST, UNFOLLOW_SUCCESS, 
  LOAD_MY_INFO_REQUEST, LOAD_MY_INFO_SUCCESS, LOAD_MY_INFO_FAILURE,
  CHANGE_NICKNAME_REQUEST, CHANGE_NICKNAME_SUCCESS, CHANGE_NICKNAME_FAILURE,
  LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWERS_SUCCESS, LOAD_FOLLOWERS_FAILURE,
  LOAD_FOLLOWINGS_REQUEST, LOAD_FOLLOWINGS_SUCCESS, LOAD_FOLLOWINGS_FAILURE, 
  REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_SUCCESS, REMOVE_FOLLOWER_FAILURE, 
  LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE,
  CHANGE_PASSWORD_REQUEST, CHANGE_PASSWORD_SUCCESS, CHANGE_PASSWORD_FAILURE,
  LOG_PASSCHECK_REQUEST, LOG_PASSCHECK_SUCCESS, LOG_PASSCHECK_FAILURE,
} from '../reducers/user';

function changeNicknameAPI(data) {
  return axios.patch('/user/nickname', { nickname: data });
}

function* changeNickname(action) {
  try {
    const result = yield call(changeNicknameAPI, action.data);
    yield put({
      type: CHANGE_NICKNAME_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: CHANGE_NICKNAME_FAILURE,
      error: err.response.data,
    });
  }
}

// 서버로 패스워드 수정하는 요청
function changePasswordAPI(data) {
  return axios.patch('/user/passwordchange', { password: data });
}

function* changePassword(action) {
  try {
    const result = yield call(changePasswordAPI, action.data);
    yield put({
      type: CHANGE_PASSWORD_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: CHANGE_PASSWORD_FAILURE,
      error: err.response.data,
    });
  }
}

function removeFollowerAPI(data) {
  return axios.delete(`/user/follower/${data}`); // 1)서버로 팔로우 하는 요청을 보내고
}

function* removeFollower(action) {
  try {
    const result = yield call(removeFollowerAPI, action.data);
    yield put({
      type: REMOVE_FOLLOWER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: REMOVE_FOLLOWER_FAILURE,
      error: err.response.data,
    });
  }
}
function loadMyInfoAPI() {
  return axios.get('/user');
}

function* loadMyInfo() {
  try {
    const result = yield call(loadMyInfoAPI);
    yield put({
      type: LOAD_MY_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_MY_INFO_FAILURE,
      error: err.response.data,
    });
  }
}

function loadUserAPI(data) {
  return axios.get(`/user/${data}`);
}

function* loadUser(action) {
  try {
    const result = yield call(loadUserAPI, action.data);
    yield put({
      type: LOAD_USER_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: LOAD_USER_FAILURE,
      error: err.response.data,
    });
  }
}

function loadMyFollowingsAPI() {
  return axios.get('/user/followings'); // 1)서버로 팔로우 하는 요청을 보내고
}

function* loadMyFollowings(action) {
  try {
    const result = yield call(loadMyFollowingsAPI, action.data);
    yield put({
      type: LOAD_FOLLOWINGS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: LOAD_FOLLOWINGS_FAILURE,
      error: err.response.data,
    });
  }
}

function loadMyFollowersAPI() {
  return axios.get('/user/followers'); // 1)서버로 팔로우 하는 요청을 보내고
}

function* loadMyFollowers(action) {
  try {
    const result = yield call(loadMyFollowersAPI, action.data);
    yield put({
      type: LOAD_FOLLOWERS_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: LOAD_FOLLOWERS_FAILURE,
      error: err.response.data,
    });
  }
}

function followAPI(data) {
  return axios.patch(`/user/${data}/follow`); // 1)서버로 팔로우 하는 요청을 보내고 json 데이터를 받아온다.
}

function* follow(action) {
  try {
    const result = yield call(followAPI, action.data);
    yield put({
      type: FOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: FOLLOW_FAILURE,
      error: err.response.data,
    });
  }
}

function unfollowAPI(data) {
  return axios.delete(`/user/${data}/follow`); // 1)서버로 언팔로우 하는 요청을 보내고 json 데이터를 받아온다
}

function* unfollow(action) {
  try {
    const result = yield call(unfollowAPI, action.data);
    yield put({
      type: UNFOLLOW_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: UNFOLLOW_FAILURE,
      error: err.response.data,
    });
  }
}

function logInAPI(data) { // 데이터는 쿠키를 전달
  return axios.post('/user/login', data); // 1)서버로 로그인 하는 요청을 보내고
} // saga => router user => local.js => router user check => passport (cookie와 user.id)

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: LOG_IN_FAILURE,
      error: err.response.data,
    });
  }
}

function passCheckAPI(data) { // 데이터는 쿠키를 전달
  console.log('sagas passCheckAPI', data);
  return axios.post('/user/passcheck', data); // 1)서버로 패스체크하는 요청을 보낸다
} // saga => router user => local.js => router user check => passport (cookie와 user.id)

function* passCheck(action) {
  try {
    const result = yield call(passCheckAPI, action.data);
    console.log('sagas action.data:', action.data);
    yield put({
      type: LOG_PASSCHECK_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: LOG_PASSCHECK_FAILURE,
      error: err.response.data,
    });
  }
}

function logOutAPI() {
  return axios.post('/user/logout'); // 1)서버로 로그아웃 하는 요청을 보내고
}

function* logOut() {
  try {
    yield call(logOutAPI); // 2)요청의 결과를 받아온다.
    yield put({
      type: LOG_OUT_SUCCESS,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: LOG_OUT_FAILURE,
      error: err.response.data,
    });
  }
}

function signUpAPI(data) {
  return axios.post('/user', data); // 1)서버로 회원가입 하는 요청을 보내고
} // post, petch는 데이터를 넘길 수 있다.

function* signUp(action) {
  try {
    const result = yield call(signUpAPI, action.data); // 2)요청의 결과를 받아온다.
    console.log('회원가입', result);
    yield put({
      type: SIGN_UP_SUCCESS,
    });
  } catch (err) {
    yield put({ // put = dispatch
      type: SIGN_UP_FAILURE,
      error: err.response.data,
    });
  }
}

function* watchRemoveFollower() {
  yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower);
}

function* watchloadMyFollowers() {
  yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadMyFollowers);
}

function* watchloadMyFollowings() {
  yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadMyFollowings);
}

function* watchChangeNickname() {
  yield takeLatest(CHANGE_NICKNAME_REQUEST, changeNickname);
}

function* watchChangePassword() {
  yield takeLatest(CHANGE_PASSWORD_REQUEST, changePassword);
}

function* loadMyInfoFollow() {
  yield takeLatest(LOAD_MY_INFO_REQUEST, loadMyInfo);
}

function* watchFollow() {
  yield takeLatest(FOLLOW_REQUEST, follow);
}

function* watchUnFollow() {
  yield takeLatest(UNFOLLOW_REQUEST, unfollow); 
}

function* watchPassCheck() {
  yield takeLatest(LOG_PASSCHECK_REQUEST, passCheck);
}

function* watchLogIn() {
  yield takeLatest(LOG_IN_REQUEST, logIn);
}

function* watchLogOut() {
  yield takeLatest(LOG_OUT_REQUEST, logOut); 
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp); 
}

function* watchloadUser() {
  yield takeLatest(LOAD_USER_REQUEST, loadUser); 
}

export default function* userSaga() {
  yield all([
    fork(watchRemoveFollower),
    fork(watchloadMyFollowers),
    fork(watchloadMyFollowings),
    fork(watchChangeNickname),
    fork(watchChangePassword),
    fork(loadMyInfoFollow),
    fork(watchloadUser),
    fork(watchFollow),
    fork(watchUnFollow),
    fork(watchPassCheck),
    fork(watchLogIn),
    fork(watchLogOut),
    fork(watchSignUp),
  ]);
}
