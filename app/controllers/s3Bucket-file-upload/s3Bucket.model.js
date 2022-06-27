const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'AKIAYVUT44SCMGQEUBL7',
    secretAccessKey: 'P+8E1XgYKBhv6X75exfjcWZx/byzN+LyX3Nv9kXM'
});

const fileName = 'sample.jpg';

const uploadFile = () => {
  fs.readFile(fileName, (err, data) => {
     if (err) throw err;
     const params = {
         Bucket: 'maiora-life-sciences', // pass your bucket name
         Key: 'sample.jpg', // file will be saved as test-fit-socials/csr3.jpg
         Body: JSON.stringify(data, null, 2)
     };
     s3.upload(params, function(s3Err, data) {
         if (s3Err) throw s3Err
         console.log(`File uploaded successfully at ${data.Location}`)
     });
  });
};

uploadFile();