require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const saveS3Resume = async (fileBuffer, userId) => {
  const currentTime = Date.now();
  const key = `uploads/${userId}/${currentTime}.pdf`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: "application/pdf",
  };
  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log("saved to S3:");
    //return the key so we can delete it if the db save fails
    return {
      key: key,
      pdfUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/uploads/${userId}/${currentTime}.pdf`,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return null;
  }
};

const deleteS3Resume = async (key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };
  try {
    const command = new DeleteObjectCommand(params);
    s3.send(command);
    console.log("deleted from S3");
  } catch (error) {
    console.error("S3 Delete Error:", error);
  }
};

module.exports = { saveS3Resume, deleteS3Resume };
