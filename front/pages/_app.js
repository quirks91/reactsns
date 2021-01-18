// 페이지들의 공통적인 부분 처리
import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head'; // next.js 헤드 컴포넌트
import 'antd/dist/antd.css';
import wrapper from '../store/configureStore';

const App = ({ Component }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>SNS</title>
      </Head>
      <Component />
    </>
  );
};

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
};

export default wrapper.withRedux(App);
