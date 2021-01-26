import React, { useCallback } from 'react';
import propTypes from 'prop-types';
import Link from 'next/link';
import Router from 'next/router';
import { Menu, Input, Row, Col } from 'antd';
import styled, { createGlobalStyle } from 'styled-components';
import { useSelector } from 'react-redux';
import UserProfile from './UserProfile';
import LoginForm from './LoginForm';
import useInput from '../hooks/useInput';

const SearchInput = styled(Input.Search)`
  width: 300px;
  vertical-align: middle;

  @media (min-width: 320px) and (max-width: 480px) {
    
    width: 200px;
  }
  `;

const StyledMenuWrapper = styled.div`
  max-width: 1000px;
  width: 100vw;
  margin:0 auto;
  padding: 10px;
  `;

const StyledMenu = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;  

  @font-face {
    font-family: 'BMEULJIRO';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/BMEULJIRO.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  a {
    color: black;
  }

  div:first-child{
    font-family: 'BMEULJIRO';
  }

  div{
    font-size: 18px;
  }

  @media (min-width: 320px) and (max-width: 480px) {

    div {
      font-size: 16px;
    }
  }

`;

// const ContentWrapper = styled.div` 
//   width: 1000px;
//   margin:0 auto;
// `;

const ContentWrapper = styled.div` 
  max-width: 1000px;
  width: 100vw;
  margin:0 auto;
`;

const Global = createGlobalStyle`
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
`;

const AppLayout = ({ children }) => {
  const [searchInput, onChangeSearchInput] = useInput('');
  const { me } = useSelector((state) => state.user);

  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);

  return ( // 버추얼돔 리랜더링시 전체 실행은 되지만 달라진 부분만 다시 그린다. 최적화시 스타일 컴포넌트나 useMemo를 이용.
      <>
        <Global />
        
        <StyledMenuWrapper>
          <StyledMenu>
            <div>
              <Link href="/"><a>ReactSNS</a></Link>
            </div>

            <div>
              <SearchInput enterButton value={searchInput} onChange={onChangeSearchInput} onSearch={onSearch} />
            </div>

            <div>
              <Link href="/profile"><a>프로필</a></Link>
            </div>
          </StyledMenu>

        </StyledMenuWrapper>
        <div style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #DBDBDB', paddingTop: '30px' }}>
          <ContentWrapper>
            <Row gutter={12}>
              {/* xs: 모바일, sm: 태블릿, md: 작은 데스크탑 */}
              <Col xs={24} md={6}>
                {me ? <UserProfile /> : <LoginForm />}
              </Col>

              <Col xs={24} md={12}>
                {children}
              </Col>

              <Col xs={24} md={6}>
                <a href="https://github.com/wolfhoons" Using target="_blank" without rel="noreferrer">Github</a>
              </Col>
            </Row>
          </ContentWrapper>
        </div>
        {/* <AppLayout> 안에 들어가는 것이 children으로 전달 받음 </AppLayout> */}
      </>
  );
};

AppLayout.propTypes = {
  children: propTypes.node.isRequired, // 타입 확인, prop-types의 경우 성능상 이유로 개발 모드에서만 확인
};

export default AppLayout;
