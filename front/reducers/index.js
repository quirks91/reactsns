import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import user from './user';
import post from './post';

// async(비동기) 액션을 만드는 함수 - redux-saga

// (이전상태, 액션) => 다음 상태
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log('HYDRATE', action);
      return action.payload;
    default: {
      const combinedReducer = combineReducers({
        user,
        post,
      });
      return combinedReducer(state, action);
    }
  }
};

// const rootRuducer = combineReducers({
//   user,
//   post,
// });

export default rootReducer;
