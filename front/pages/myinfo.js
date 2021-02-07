import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head'; // next.js 헤드 컴포넌트
import { useSelector, useDispatch } from 'react-redux';
import Router from 'next/router';
import { END } from 'redux-saga';
import axios from 'axios';
import useSWR from 'swr';
import { Form, Input, Button } from 'antd';
import useInput from '../hooks/useInput';
import wrapper from '../store/configureStore';
import styled from 'styled-components';
import AppLayout from '../components/AppLayout';

import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import { backUrl } from '../config/config';
import { CHANGE_PASSWORD_REQUEST } from '../reducers/user';

const ErrorMessage = styled.div`
  color: red;
`;

const Myinfo = () => {
  const dispatch = useDispatch();
  const { me, changePasswordDone } = useSelector((state) => state.user);
  const [password, changePassword] = useInput('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const onChangePasswordCheck = useCallback((e) => {
    setPasswordCheck(e.target.value);
    setPasswordError(e.target.value !== password);
  }, [password]);

  const onSubmitPassword = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }

    dispatch({
      type: CHANGE_PASSWORD_REQUEST,
      data: password,
    });
  }, [password, passwordCheck]);

  useEffect(() => {
    if (changePasswordDone) {
      Router.push('/');
    }
  }, [changePasswordDone]); 

  useEffect(() => {
    if(!(me && me.id)) {
      Router.push('/');
    }
  }, [me && me.id]);

  if(!me) {
    return '정보 로딩중';
  }

  return (
    <>
      <Head>
        <title>내 프로필 / SNS</title>
      </Head>
      
      <AppLayout>
        <Form onFinish={onSubmitPassword}>
          <div>
            <label htmlFor="user-password">새 비밀번호</label><br />
            <Input 
              name="user-password" 
              type="password" 
              value={password} 
              onChange={changePassword} 
              required />
          </div>

          <div>
            <label htmlFor="user-password">새 비밀번호 확인</label><br />
            <Input 
              name="user-password-check" 
              type="password" 
              value={passwordCheck} 
              onChange={onChangePasswordCheck}
              required />
              {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
          </div>
          <Button type="primary" htmlType="submit">비밀번호 수정</Button>
        </Form>
      </AppLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie ) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END); // next-redux-warpper에 정해진 틀
  await context.store.sagaTask.toPromise();
  console.log('getServerSideProps end');
});

export default Myinfo;
