import { Form, Input } from 'antd';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useInput from '../hooks/useInput';
import { CHANGE_NICKNAME_REQUEST, CHANGE_PASSWORD_REQUEST } from '../reducers/user';

const NicknameEditForm = () => {
  const { me } = useSelector((state) => state.user);
  const [nickname, onChangeNickname] = useInput(me?.nickname || '');
  const [password, changePassword] = useInput('');
  const dispatch = useDispatch();

  const onSubmit = useCallback(() => {
    dispatch({
      type: CHANGE_NICKNAME_REQUEST,
      data: nickname,
    });
  }, [nickname]);

  const onSubmitPassword = useCallback(() => {
    dispatch({
      type: CHANGE_PASSWORD_REQUEST,
      data: password,
    });
  }, [password]);

  return (
    <Form style={{ marginBottom: '20px', border: '1px solid #d9d9d9', padding: '20px' }}>
      <Input.Search
        value={nickname}
        onChange={onChangeNickname}
        addonBefore="닉네임"
        enterButton="수정"
        onSearch={onSubmit}
        style={{ paddingBottom: '10px' }}
      />
      {/* <Input.Search
        value={password}
        type="password"
        onChange={changePassword}
        addonBefore="비밀번호"
        enterButton="수정"
        onSearch={onSubmitPassword}
      /> */}
    </Form>
  );
};

export default NicknameEditForm;
