import React, { useCallback } from 'react';
import propTypes from 'prop-types';
import Link from 'next/link';
import Router from 'next/router';
import { Input, Row, Col, Menu, Dropdown } from 'antd';
import AccountCircleSharpIcon from '@material-ui/icons/AccountCircleSharp';
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { logoutRequestAction } from '../reducers/user';
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

  div {
    font-size: 16px;
  }

  a {
    color: black;
  }

  div:first-child{
    font-family: 'ohmni050';
    font-size: 20px;
  }

  /* div:nth-child(2){
  } */

  span {
    padding-left: 10px;
  }

  // 스마트폰 사이즈
  @media (min-width: 320px) and (max-width: 480px) {
    div {
      font-size: 16px;
    }
  }

`;

const ContentWrapper = styled.div` 
  max-width: 1000px;
  width: 100vw;
  margin:0 auto;
`;

const AtdMenu = styled(Menu)`
  margin-top:11px;
`;

const AppLayout = ({ children }) => {
  const dispatch = useDispatch();
  const [searchInput, onChangeSearchInput] = useInput('');
  const { me, LogOutLoading } = useSelector((state) => state.user);

  const onLogOut = useCallback(() => {
    dispatch(logoutRequestAction());
  }, []);

  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);

  const menu = (
    <>
      {me
        ? (
          <AtdMenu>
            <Menu.Item>
              <a onClick={onLogOut} loading={LogOutLoading}>
                로그아웃
              </a>
            </Menu.Item>
            <Menu.Item>
              <Link href="/myinfo">
                <a>
                  회원정보관리
                </a>
              </Link>
            </Menu.Item>
          </AtdMenu>
        )
        : (
          <AtdMenu>
            <Menu.Item>
              <Link href="/login">
                <a>
                  로그인
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item>
              <Link href="/signup">
                <a>
                  회원가입
                </a>
              </Link> 
            </Menu.Item>
          </AtdMenu>
        )}
    </>
  );

  // 버추얼돔 리랜더링시 전체 실행은 되지만 달라진 부분만 다시 그린다. 
  // 최적화시 스타일 컴포넌트나 useMemo를 이용.
  return ( 

    <>
      <StyledMenuWrapper>
        <StyledMenu>
          <div>
            <Link href="/"><a style={{ color: '#20c997' }}>ReactSNS</a></Link>
          </div>

          <div>
            <SearchInput
              enterButton
              value={searchInput}
              onChange={onChangeSearchInput}
              onSearch={onSearch}
              placeholder="해시태그를 검색할 수 있습니다"
            />
          </div>

          <div>
            <span>
              <Link href="/profile"><a><AccountCircleSharpIcon style={{ fontSize: '28px', marginTop: '5px' }} /></a></Link>
            </span>
            <span>
              <Dropdown overlay={menu} placement="bottomRight">
                <a><SettingsSharpIcon style={{ fontSize: '28px', marginTop: '5px' }} /></a>
              </Dropdown>
            </span>
          </div>
        </StyledMenu>
      </StyledMenuWrapper>
        
      <div style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid #DBDBDB', paddingTop: '30px' }}>
        <ContentWrapper>
          <Row justify="center">
            {/* xs: 모바일, sm: 태블릿, md: 작은 데스크탑 */}

            {/* <Col xs={24} md={6}>
                {me ? <UserProfile /> : <LoginForm />}
              </Col> */}

            <Col xs={24} md={12}>
              {children}
            </Col>

            {/* <Col xs={24} md={6}>
                <a href="https://github.com/wolfhoons" Using target="_blank" without rel="noreferrer">Github</a>
              </Col> */}
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
