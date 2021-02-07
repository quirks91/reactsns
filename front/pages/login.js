import React, { useCallback, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { END } from 'redux-saga';
import Link from 'next/link';
import Head from 'next/head'; // next.js 헤드 컴포넌트
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import Router from 'next/router';
import axios from 'axios';
import useInput from '../hooks/useInput';
import wrapper from '../store/configureStore';
import { loginRequestAction, LOAD_MY_INFO_REQUEST } from '../reducers/user';
import { LOAD_POSTS_REQUEST } from '../reducers/post';

const ButtonWrapper = styled.div`
  margin-top: 10px; //css 적듯이
`;

const FormWrapper = styled(Form)`
  padding: 10px;
`;

const Login = () => {
  const dispatch = useDispatch();
  const { logInLoading, logInError, logInDone } = useSelector((state) => state.user);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  
  useEffect(() => {
    if(logInError) {
      alert(logInError);
      Router.push('/');
    }
  }, [logInError]);
  
  const onSubmitForm = useCallback(() => {
    console.log(email, password);
    dispatch(loginRequestAction({ email, password })); // 로그인 버튼 누르면 로그인 리퀘스트가 실행됨
  }, [email, password]);

  useEffect(() => {
    if (logInDone) {
      Router.push('/');
    }
  }, [logInDone]); 

  return (
    <>
      {/* <AppLayout> */}
        <Head>
          <title>로그인 / SNS</title>
        </Head>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height:'80vh', width:'100vw' }}>
          <FormWrapper onFinish={onSubmitForm}>
            <div>
              <label htmlFor="user-email">이메일</label><br />
              <Input name="user-email" type="email" value={email} onChange={onChangeEmail} required />
            </div>

            <div>
              <label htmlFor="user-password">비밀번호</label><br />
              <Input name="user-password" type="password" value={password} onChange={onChangePassword} required />
            </div>

            <ButtonWrapper>
              <Button type="primary" htmlType="submit" loading={logInLoading}>로그인</Button>
              <Link href="/signup"><a><Button>회원가입</Button></a></Link>
            </ButtonWrapper>
          </FormWrapper>
      </div>
      {/* </AppLayout> */}
    </>
  );
};

export default Login;
