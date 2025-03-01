const fs = require("fs");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const DiffMatchPatch = require("diff-match-patch");
const dmp = new DiffMatchPatch();

const getTextContentsFromPdf = async (pdfUrl) => {
  // code to extract text from pdf
  try {
    if (!pdfUrl) return;
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
  dmp.diff_cleanupEfficiency(diffs, 4);

  let removedText = "";
  let addedText = "";

  diffs.forEach((diff) => {
    //check that is not a whitespace change or empty
    if (diff[1].length == 0 || /^\s+$/.test(diff[1])) return;
    //remove bullet points from the text
    diff[1] = diff[1].replace(/^[••▪◦●]\s*/gm, "");
    if (diff[0] === -1) {
      removedText += `${diff[1]}\n──────────────\n`;
    }
    if (diff[0] === 1) {
      addedText += `• ${diff[1]}\n──────────────\n`;
    }
  });

  if (addedText.length >= 1020) {
    addedText = addedText.substring(0, 1020) + "...";
  }
  if (removedText.length >= 1020) {
    removedText = removedText.substring(0, 1020) + "...";
  }

  return { addedText, removedText };
};

module.exports = { compareTextDiff };
