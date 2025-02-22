require("dotenv").config();
const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} = require("@aws-sdk/client-dynamodb");
const { deleteS3Resume } = require("./s3");

const dynamoClient = new DynamoDBClient({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const saveDbResume = async (pdfUrl, pdfName, userId, version, s3Key) => {
  try {
    if (!pdfUrl || !userId) {
      console.error("Invalid userId or pdfUrl");
      return;
    }
    const resumeRecord = {
      user_id: { S: userId },
      resume_version: { S: version },
      resume_url: { S: pdfUrl },
      resume_name: { S: pdfName },
      created_at: { S: new Date().toISOString() },
    };

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: resumeRecord,
    };
    const putCommand = new PutItemCommand(params);
    await dynamoClient.send(putCommand);
  } catch (error) {
    console.error("Error creating resume in DB:", error);
    //if theres an error in saving the resume, delete the uploaded file from s3
    await deleteS3Resume(s3Key);
  }
};

const getLatestDbResume = async (userId) => {
  try {
    if (!userId) {
      console.error("Invalid userId");
      return;
    }
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
      ScanIndexForward: false,
      Limit: 1,
    };
    const getCommand = new QueryCommand(params);
    const { Items } = await dynamoClient.send(getCommand);
    console.log(Items);
    return Items;
  } catch (error) {
    console.error("Error getting resume from DB:", error);
  }
};

const updateDbResume = async (userId, pdfUrl, pdfName, key) => {
  try {
    //get the latest resume
    const latestResumeList = await getLatestDbResume(userId);
    if (!latestResumeList || latestResumeList.length === 0) {
      console.error("No resume found for this user");
      return;
    }
    const latestResume = latestResumeList[0];
    //get the version of the latest resume
    const latestVersion = latestResume.resume_version.S;
    //get the number value
    const versionNumber = parseInt(latestVersion.replace("v", ""));
    const newVersion = `v${versionNumber + 1}`;
    await saveDbResume(pdfUrl, pdfName, userId, newVersion);
    console.log("Updated resume in DB");
  } catch (error) {
    console.error("Error updating resume in DB:", error);
    //if theres an error in saving the resume, delete the uploaded file from s3
    await deleteS3Resume(key);
  }
};

module.exports = { saveDbResume, updateDbResume, getLatestDbResume };
