// 페이지들의 공통적인 부분 처리
import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head'; // next.js 헤드 컴포넌트
import 'antd/dist/antd.css';
import styled, { createGlobalStyle } from 'styled-components';
import wrapper from '../store/configureStore';
import 'bootstrap/dist/css/bootstrap.min.css';

const Global = createGlobalStyle`
  @font-face {
    font-family: 'ohmni050';
    src: url('/fonts/210 ohmni 050.woff2') format('woff2');
  }
  @font-face {
    font-family: 'ohmni030';
    src: url('/fonts/210 ohmni 030.woff2') format('woff2');
  }

  * {
    font-family: 'ohmni030';
  }

  .ant-row {
    margin-right:0 !important;
    margin-left: 0 !important;
  }

  .ant-col:first-child {
    padding-left: 0 !important;
  }

  .ant-col:last-child {
    padding-right: 0 !important;
  } // ant guttur 스크롤 문제 발생 시

  .ant-btn-primary {
      border: 1px solid #20c997;
      background-color: #20c997;
  }

  .ant-btn .anticon {
    display:flex;
    position:relative;
    top:--1px;
    right:4px;
  }

  .ant-list-empty-text {
    display: none;
  }
`;

const App = ({ Component }) => {
  return (
    <>
      <Global />
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
