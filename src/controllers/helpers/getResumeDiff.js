const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const DiffMatchPatch = require("diff-match-patch");
const dmp = new DiffMatchPatch();

const getTextContentsFromPdf = async (pdfUrl) => {
  // code to extract text from pdf
  try {
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfData = await pdfParse(response.data);
    return pdfData.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
  }
};

const compareTextDiff = async (oldPdf, newPdf) => {
  if (!oldPdf || !newPdf) {
    console.error("no URLS provided for both old and new PDFs.");
    return;
  }

  const oldText = await getTextContentsFromPdf(oldPdf);
  const newText = await getTextContentsFromPdf(newPdf);

  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);
  let result = "";
  diffs.forEach((diff) => {
    if (diff[1].length == 0) return;
    diff[1] = diff[1].replace(/^[••▪◦●\-]\s*/gm, "");
    if (diff[0] === -1) {
      result += `🔴 Removed: ${diff[1]}\n`;
    }
    if (diff[0] === 1) {
      result += `🟢 Added: ${diff[1]}\n`;
    }
  });

  return result ?? "No changes found.";
};

module.exports = { compareTextDiff };
