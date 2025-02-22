/**
 * validate pdf file and return the buffer to pass to the s3 bucket
 * @param {*} attachment discord interaction's attachment
 * @returns buffer
 */
const validatePdf = async (attachment, interaction) => {
  try {
    if (!attachment || attachment.contentType !== "application/pdf") {
      return interaction.reply("❌ Please upload a valid PDF file.");
    }
    //do a check that the file size is less than 10MB
    if (attachment.size > 10 * 1024 * 1024) {
      return interaction.reply("❌ File size should be less than 10MB.");
    }

    const response = await fetch(attachment.url);

    if (!response.ok) throw new Error("Failed to fetch the file.");

    //convert file to buffer format to pass it to s3 bucket
    const buffer = await response.arrayBuffer();
    console.log("PDF validated successfully.");
    return buffer;
  } catch (error) {
    console.error("Error processing PDF:", error);
  }
};

module.exports = { validatePdf };
