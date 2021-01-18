const passport = require('passport');
const local = require('./local');
const { User } = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => { // 서버쪽에 [{ id: 1, cookie: 'clhxy' }]
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => { 
    try {
      const user = await User.findOne({ where: { id }});
      done(null, user); // req.user
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();
};

// back app.js에서 실행
// 프론트에서 서버로 cookie
// 서버가 cookie-parser, express-session으로 쿠키 검사 후 id: 1 발견
// id: 1이 deseriallizeUser에 들어감
// req.user로 사용자 정보가 들어감

// 요청 보낼 때 마다 deseriallizeUser 실행 (db요청 1번씩)
// 실무에선 deseriallizeUser 결과물 캐싱