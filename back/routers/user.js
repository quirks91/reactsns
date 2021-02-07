const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { Op } = require('sequelize');

const { User, Post, Comment, Image } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', async (req, res, next) => { //get /user
  try{
    if(req.user){
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        attributes: { // 특정데이터를 가져오거나 제외할 수 있다.
          exclude: ['password'] //제외
        },
        include: [{
          model: Post,
          attributes: ['id'], 
        }, {
          model: User,
          as: 'Followings',  
          attributes: ['id'], 
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'], 
        }]
      })
      res.status(200).json(fullUserWithoutPassword);
    } else {
      res.status(200).json(null);
    }
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/', isNotLoggedIn, async (req, res, next) => { // POST /user/
  console.log(req.headers);
  try {
    const exUser = await User.findOne({ // database에서 값을 찾는다.
      where: { // 조건
        email: req.body.email,
      }
    });
      if(exUser) {
        return res.status(403).send('이미 사용중인 아이디입니다.'); // 응답은 무조건 한번 보내야하기 떄문에 반드시 리턴을 붙여야한다
      } // 요청/응답은 헤더(상태,용량,시간,쿠키)와 바디(데이터)로 구성되어있다.
      const hashedPassword = await bcrypt.hash(req.body.password, 10); // 비밀번호 암호화 단계 10~13 적절
      await User.create({ // db table에 data를 넣어준다. await을 쓰려면 async함수로 만들어줘야 한다.
        email: req.body.email, // await이 없어도 data는 들어가지만 비동기가 되어서 res가 먼저 들어간다. 순서 맞춰주기 위한 작업
        nickname: req.body.nickname, // sagas user에서 넘긴 data가 req.body에있다.
        password: hashedPassword, // req.body를 이용하려면 back app.js에 express.json/expres.urlencoded를 해줘야한다.
      });
      res.status(200).send('ok'); // 200성공, 300리다이렉트, 400클라이언트에러, 500서버에러
  } catch (error) {
    console.error(error);
    next(error); // next를 통해서 error를 보내면 브라우저로 알려준다. status 500
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => { //서버에러, 성공, 인포
    if (err) {
      console.log(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      //req.login passport 로그인 허락
      if (loginErr){
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'] //제외
        },
        include: [{
          model: Post,
          attributes: ['id'], 
        }, {
          model: User,
          as: 'Followings',  
          attributes: ['id'], 
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'], 
        }]
      })
      return res.status(200).json(fullUserWithoutPassword);
    })
  })(req, res, next); //미들웨어 확장 express기법
}); // POST /user/login

router.get('/followers', isLoggedIn, async (req, res, next) =>{ // GET /user/followers
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.send(403).send('팔로워하고 있는 유저가 없습니다.');
    }
    const followers = await user.getFollowers({
      limit: parseInt(req.query.limit, 10),
    });
    res.status(200).json(followers);
  } catch (error){
    console.log(error);
    next(error);
  }
});

router.get('/followings', isLoggedIn, async (req, res, next) =>{ // PATCH /user/followings
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.send(403).send('팔로잉하고 있는 유저가 없습니다.');
    }
    const followings = await user.getFollowings({
      limit: parseInt(req.query.limit, 10), 
    });
    res.status(200).json(followings);
  } catch (error){
    console.log(error);
    next(error);
  }
});

router.get('/:id', async (req, res, next) => { // GET /user/3
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.params.id },
      attributes: {
        exclude: ['password']
      },
      include: [{
        model: Post,
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followers',
        attributes: ['id'],
      }]
    })
    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON();
      data.Posts = data.Posts.length;
      data.Followings = data.Followings.length;
      data.Followers = data.Followers.length;
      res.status(200).json(data);
    } else {
      res.status(404).json('존재하지 않는 사용자입니다.');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:id/posts', async (req, res, next) => { // GET /user/1/posts
  try {
    const user = await User.findOne({ where: { id: req.params.id }});
    if (user) {
      const where = {};
      if (parseInt(req.query.lastId, 10)) { // 초기 로딩이 아닐 때
        where.id = { [Op.lt]: parseInt(req.query.lastId, 10)}
      } // 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
      const posts = await user.getPosts({
        where,
        limit: 10,
        include: [{
          model: Image,
        }, {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'nickname'],
          }]
        }, {
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: User,
          through: 'Like',
          as: 'Likers',
          attributes: ['id'],
        }, {
          model: Post,
          as: 'Retweet',
          include: [{
            model: User,
            attributes: ['id', 'nickname'],
          }, {
            model: Image,
          }]
        }],
      });
      console.log(posts);
      res.status(200).json(posts);
    } else {
      res.status(404).send('존재하지 않는 사용자입니다.');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/nickname', isLoggedIn, async (req, res, next) =>{
  try {
    await User.update({
      nickname: req.body.nickname,
    }, {
      where: { id: req.user.id }, 
    });
    res.status(200).json({ nickname: req.body.nickname });
  } catch (error){
    console.log(error);
    next(error);
  }
});

// // 응답, 요청, 다음 라우터
// router.post('/passcheck', isLoggedIn ,async (req, res, next) => {
//   const pass = req.body.password;
//   try {
//     const passchecker = await User.findOne({
//       where: { email: req.user.email },
//       // attributes: {
//       //   exclude: ['password'] //제외
//       // },
//       include: [{
//         model: Post,
//         attributes: ['id'], 
//       }, {
//         model: User,
//         as: 'Followings',  
//         attributes: ['id'], 
//       }, {
//         model: User, 
//         as: 'Followers',
//         attributes: ['id'], 
//       }]
//     })
//     const result = await bcrypt.compare(password, pass);
//     if(result) {
//       return res.status(200).json(passchecker);
//     } else {
//       return res.status(200).json(pass);
//       // return res.status(500).send({ error: '비밀번호가 틀렸습니다.'});
//     }
//   } catch (error) {
//     console.log('router passcheck error: ',error);
//     next(error);
//   }
// }); // POST /user/passcheck

router.post('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

router.patch('/passwordchange', isLoggedIn, async (req, res, next) =>{
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    await User.update({
      password: hashedPassword,
    }, {
      where: { id: req.user.id }, 
    });
    res.status(200).json({ password: hashedPassword });
  } catch (error){
    console.log(error);
    next(error);
  }
});

router.patch('/:userId/follow', isLoggedIn, async (req, res, next) =>{ // PATCH /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.send(403).send('없는 유저를 팔로우 하려고 하십니다');
    }
    await user.addFollowers(req.user.id)
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error){
    console.log(error);
    next(error);
  }
});

router.delete('/:userId/follow', isLoggedIn, async (req, res, next) =>{ // PATCH /user/follower/2
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.send(403).send('없는 유저를 언팔로우 하려고 하십니다.');
    }
    await user.removeFollowers(req.user.id)
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error){
    console.log(error);
    next(error);
  }
});

router.delete('/follower/:userId/', isLoggedIn, async (req, res, next) =>{ // DELETE /user/follow/id
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.send(403).send('없는 유저를 차단 하려고 하십니다.');
    }
    await user.removeFollowing(req.params.UserId)
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error){
    console.log(error);
    next(error);
  }
});

module.exports = router ;