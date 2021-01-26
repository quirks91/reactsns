import React, { useCallback, useState, useEffect } from 'react';
import Head from 'next/head'; // next.js 헤드 컴포넌트
import { END } from 'redux-saga';
import axios from 'axios';

import { Form, Input, Checkbox, Button, AutoComplete } from 'antd';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import Router from 'next/router';
import Link from 'next/link';
import wrapper from '../store/configureStore';
import useInput from '../hooks/useInput';
import { SIGN_UP_REQUEST, LOAD_MY_INFO_REQUEST } from '../reducers/user';
import AppLayout from '../components/AppLayout';

const ErrorMessage = styled.div`
  color: red;
`;

const StyledTitle = styled.h1`
  @font-face {
    font-family: 'BMEULJIRO';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/BMEULJIRO.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  padding: 20px;
  border-bottom: 1px solid #DBDBDB;

  font-family: 'BMEULJIRO';

`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled(Input)`
  width: 300px;
  margin-bottom: 10px;
`;

const StyledButton = styled(Button)`
  width: 300px;
`;

const Signup = () => {
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError, me } = useSelector((state) => state.user);

  useEffect(() => {
    if ( me && me.id ) {
      Router.replace('/');
    }
  }, [me && me.id]);

  useEffect(() => {
    if (signUpDone) {
      Router.push('/');
    }
  }, [signUpDone]); // 회원가입이 완료되면 메인페이지로 돌아가게

  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError]);

  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, onChangePassword] = useInput('');

  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const onChangePasswordCheck = useCallback((e) => {
    setPasswordCheck(e.target.value);
    setPasswordError(e.target.value !== password);
  }, [password]);

  const [term, setTerm] = useState('');
  const [termError, setTermError] = useState('');
  const onChangeTerm = useCallback((e) => {
    setTerm(e.target.checked);
    setTermError(false);
  }, []);

  const onSubmit = useCallback(() => {
    if (password !== passwordCheck) {
      return setPasswordError(true);
    }
    if (!term) {
      return setTermError(true);
    }
    console.log(email, nickname, password);
    dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, password, nickname },
    });
  }, [password, passwordCheck, term]);

  return (
    <>
      {/* <AppLayout> */}
        <Head>
          <title>회원가입 / SNS</title>
        </Head>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height:'80vh', width:'100vw' }}>
          <Form onFinish={onSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <StyledTitle>
                React SNS
              </StyledTitle>
              <div>
                <StyledLabel htmlFor="user-email">이메일</StyledLabel> <br />
                <StyledInput name="user-email" type="email" value={email} required onChange={onChangeEmail} />
              </div>
              <div>
                <StyledLabel htmlFor="user-nick">닉네임</StyledLabel> <br />
                <StyledInput name="user-nick" value={nickname} required onChange={onChangeNickname} />
              </div>
              <div>
                <StyledLabel htmlFor="user-password">비밀번호</StyledLabel> <br />
                <StyledInput name="user-password" type="password" value={password} required onChange={onChangePassword} />
              </div>
              <div>
                <StyledLabel htmlFor="user-password-check">비밀번호체크</StyledLabel> <br />
                <StyledInput
                  name="user-password-check"
                  type="password"
                  value={passwordCheck}
                  required
                  onChange={onChangePasswordCheck}
                />
                {passwordError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
              </div>
              <div>
                <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>포트폴리오 사이트 입니다</Checkbox>
                {termError && <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>}
              </div>
              <div style={{ marginTop: 10 }}>
                <StyledButton type="primary" htmlType="submit" loading={signUpLoading}>가입하기</StyledButton>
              </div>
            </div>
            <br />
            <div style={{ textAlign: "center" }}>
              계정이 있으신가요? <Link href="/"><a>로그인</a></Link>
            </div>
          </Form>
        </div>
      {/* </AppLayout> */}
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
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default Signup;
