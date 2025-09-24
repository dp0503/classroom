const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION });

async function uploadToS3({ bucket, key, body, contentType }) {
	const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType });
	await s3.send(cmd);
	return { bucket, key };
}

module.exports = { s3, uploadToS3 };


