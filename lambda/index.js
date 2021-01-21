//aws자체에서 인증을 확인해서 따로 인증을 해줄 필요 없다
const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name; // reactsnsimage-s3
  const Key = decodeURIComponent(event.Recoreds[0].s3.object.key); // 한글 이름 파일
  console.log(Bucket, Key);
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length -1].toLowerCase(); // 확장자 문자열을 소문자로 전환
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;
  console.log('filename', filename, 'ext', ext);

  try {
    const s3Object = await s3.getObject({ Bucket, Key }).promise();
    console.log('original', s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body)
    .resize(400, 400, { fit: 'inside' })
    .toFormat(requiredFormat)
    .toBuffer();

    await s3.putObject({
      Bucket,
      Key: `thumb/${filename}`,
      Body: resizedImage,
    }).promise();
    console.log('put', resizedImage.length);
    return callback(null, `thumb/${filename}`);

  } catch(error) {
    console.error(error)
    return callback(error); // 람다가 끝날 때 
  }
}

