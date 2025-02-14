require("dotenv").config();
const axios = require("axios");
const pdf = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createGeminiPrompt } = require("../constants/geminiPrompt");

const processPDF = async (interaction) => {
  //defer reply since this will prolly take longer than 3 seconds
  await interaction.deferReply();

  const file = interaction.options.getAttachment("file");

  if (!file || file.contentType !== "application/pdf") {
    return interaction.editReply("Please upload a valid PDF resume.");
  }

  console.log(`Processing PDF: ${file.url}`);

  const review = await processPdfWithGemini(file.url);

  if (review) {
    interaction.editReply(`Here's the resume review:\n${review}`);
  } else {
    interaction.editReply("Couldn't process the resume. Please try again.");
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processPdfWithGemini = async (pdfUrl) => {
  try {
    //download pdf
    console.log(`Fetching PDF from: ${pdfUrl}`);
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });

    //extract text
    const pdfData = await pdf(response.data);
    const textContent = pdfData.text;

    if (!textContent.trim()) {
      console.log("No text extracted from the PDF.");
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = createGeminiPrompt(textContent);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    //if response is greater than 2000 characters, return the first 2000 characters
    if (responseText.length > 2000) {
      return responseText.substring(0, 2000);
    }

    return responseText;
  } catch (error) {
    console.error("Error processing PDF:", error);
  }
};

module.exports = { processPDF };
