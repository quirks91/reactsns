import { all, fork } from 'redux-saga/effects';
import axios from 'axios';
import { backUrl } from '../config/config';

import postSaga from './post';
import userSaga from './user';

axios.defaults.baseURL = backUrl;
// axios.defaults.baseURL = 'http://localhost:3036';
axios.defaults.withCredentials = true;

export default function* rootSaga() {
  yield all([ // all은 배열은 받는다, 동시 실행 가능
    fork(postSaga), // fork는 함수를 실행함.
    fork(userSaga),
  ]);
}
