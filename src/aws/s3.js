require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const saveS3Resume = async (fileBuffer, userId) => {
  const currentTime = Date.now();
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${userId}/${currentTime}.pdf`,
    Body: fileBuffer,
    ContentType: "application/pdf",
  };
  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log("saved to S3:");
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/uploads/${userId}/${currentTime}.pdf`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return null;
  }
};

module.exports = { saveS3Resume };
