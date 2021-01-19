const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const postRouter = require('./routers/post');
const postsRouter = require('./routers/posts');
const userRouter = require('./routers/user');
const hashtagRouter = require('./routers/hashtag');
const passport = require('passport');
const db = require('./models/index');
const app = express(); // 익스프레스 호출
const cors = require('cors');
const passportConfig = require('./passport');
const path = require('path');
const hpp = require('hpp');
const helmet = require('helmet');

dotenv.config();

db.sequelize.sync()
  .then(() => {
    console.log('DB연결 성공');
  })
  .catch('DB연결 실패', console.error);
  
passportConfig();

if(process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
  app.use(cors({
    // origin: true,
    origin: 'http://reactsns.com', //백 > 프론트 / 프론트 > 백
    credentials: true,
  }));
} else {
  app.use(morgan('dev'));
  app.use(cors({
    origin: true,
    credentials: true,
  }));
}

app.use('/', express.static(path.join(__dirname,'upload'))); //dirname back폴더, path.join으로 경로를 찾아준다
app.use(express.json()); // front에서 받은 data를 req.body에 넣어주는 역할을 한다. ( json data )
app.use(express.urlencoded({ extended: true })); // front에서 받은 data를 req.body에 넣어주는 역할을 한다. ( form data )
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  saveUninitialized: false,
  resave: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
    domain: process.env.NODE_ENV === 'production' && '.reactsns.com'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('hello express');
});

app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

app.listen(80, () => {
  console.log('서버 실행중');
});