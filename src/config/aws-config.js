const AWS = require('aws-sdk');

const awsConfig = {
    region: 'ap-southeast-1',
    // It's better not to hardcode credentials directly in code
    credentials: { 
       accessKeyId: process.env.AWS_ACCESS_KEY, 
       secretAccessKey: process.env.AWS_SECRET_KEY
    }
};

AWS.config.update(awsConfig);

module.exports = AWS;