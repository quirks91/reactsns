const express = require('express'); // === import express from 'express';
// const { noExtendLeft } = require('sequelize/types/lib/operators');
const multer = require('multer');
const { Post, Image, Comment, User, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();
const path = require('path');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { CodeBuild } = require('aws-sdk');

// 보통은 프론트에서 클라우드로 바로 올린다, 대규모 서비스시
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'reactsnsimage',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`)
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20mb 용량 제한
});

router.post('/', isLoggedIn, upload.none(), async (req, res, next) => { // POST  /post
  try {
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });

    if (hashtags) { // create 등록, findOrCreate 있으면 가져오고 없으면 등록
      const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({ //slice는 #을 빼고 DB에 저장하기 위해서 #리액트 #프로젝트
        where: { name: tag.slice(1).toLowerCase() },
      }))); // [[#노드, true], [#리액트, true]] 두번째 인자는 생성되었는지
      await post.addHashtags(result.map((v) => v[0]));
    } // [[#노드, true], [#리액트, true]] 두번째 인자는 생성되었는지

    if (req.body.image) {
      if (Array.isArray(req.body.image)) { // 이미지를 여러개 올리면 image: [aaa.png, bbb.png]
        const images = await Promise.all(req.body.image.map((image) => Image.create({ src: image }))); //DB에 create로 파일 주소를 넣어준다. (promise.all로 한번에)
        await post.addImages(images);
      } else { // 이미지를 하나만 올리면 image: aaa.png
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [{
        model: Image,
      }, {
        model: Comment, 
        include: [{
          model: User, // 댓글 작성자
          attributes: ['id', 'nickname'],
        }],
      }, {
        model: User, // 게시글 작성자
        attributes: ['id', 'nickname'],
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }]
    });
    res.status(201).json(fullPost);
  } catch(error) {
    console.error(error);
    next(error);
  }
});
// :name 파라미터 동적으로 바뀐다

router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => { // POST /post/1/retweet
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
      include: [{
        model: Post,
        as: 'Retweet',
      }],
    });

    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }

    if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
      // 내 게시글을 직접 리트윗, 내 게시글을 남이 리트윗한 게시글을 내가 리트윗하는 것을 막아준다.
      return res.status(403).send('자신의 글을 리트윗할 수 없습니다');
    }

    const retweetTargetId = post.RetweetId || post.id; //리트윗한 id가 없으면 포스트id를 리트윗한다.
    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if(exPost) {
      return res.status(403).send('이미 리트윗했습니다');
    }

    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: 'retweet',
    });

    const retweetWithPrevPost = await Post.findOne({
      where: { id: retweet.id },
      include: [{
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }, {
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }],
      }],
    })
    res.status(201).json(retweetWithPrevPost);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.get('/:postId', async (req, res, next) => { // GET /post/1
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });

    if (!post) {
      return res.status(404).send('존재하지 않는 게시글입니다.');
    }

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [{
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }, {
        model: User,
        attributes: ['id', 'nickname'],
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id', 'nickname'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }],
      }],
    })
    res.status(200).json(fullPost);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { // POST  /post
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }

    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.user.id,
    });

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{
        model: User, 
        attributes: ['id', 'nickname'],
      }],
    });
    res.status(201).json(fullComment);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { // PATCH /post/1/like
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    await post.addLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error)
  }
});

router.delete('/:postId/like', isLoggedIn, async (req, res, next) => { // DELETE /post/1/like
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    if(!post){
      return res.status(403).send('게시글이 존재하지 않습니다');
    }
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error){
    console.error(error);
    next(error);
  }
})

router.delete('/:postId', isLoggedIn ,async (req, res, next) => {  // DELETE/post/id
  try {
    await Post.destroy({
      where: { 
        id: req.params.postId, 
        UserId: req.user.id,
      },
    });
    res.json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// PostForm input name="image"에 올린게 저장된다 / 여러장: array 한장: single
router.post('/images', isLoggedIn, upload.array('image'), async (req, res, next) => { //POST /post/images
  console.log(req.files); 
  res.json(req.files.map((v) => v.location.replace(/\/original\//, '/thumb/')));
});

module.exports = router;
