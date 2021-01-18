const DataTypes = require('sequelize');
const { Model } = DataTypes;


// 최신 문법
module.exports = class Comment extends Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      }, }, 
    {
      modelName: 'Comment',
      tableName: 'comments',
      charset: 'utf8mb4', // utf8 한글 mb4 이모티콘 
      collate: 'utf8mb4_general_ci', // 한글 저장
      sequelize,
    });
  }
  static associate(db) {
    db.Comment.belongsTo(db.User);
    db.Comment.belongsTo(db.Post);
  }
}

//   (sequelize, DataTypes) => {
//   const Comment = sequelize.define('Comment', { // 모델이름이 자동 소문자 복수가 되어 저장된다 users
//     // id는 기본적으로 들어있고 순서대로 생성된다.
//     content: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     // UserId: 1
//     // PostId: 3 belongsTo 생성 시
//   }, {
//     charset: 'utf8mb4', // utf8 한글 mb4 이모티콘 
//     collate: 'utf8mb4_general_ci', // 한글 저장

//   });
//   Comment.associate = (db) => {
//     db.Comment.belongsTo(db.User);
//     db.Comment.belongsTo(db.Post);
//   };
//   return Comment;
// }