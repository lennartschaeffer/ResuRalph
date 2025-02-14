const { saveS3Resume } = require("../aws/s3");
const { saveDbResume, getLatestDbResume } = require("../aws/dynamo");
const { validatePdf } = require("./helpers/validatePdf");

const validateAndUploadPdf = async (interaction) => {
  try {
    //defer the reply
    await interaction.deferReply();

    //first check if the user has already uploaded a resume, in that case they should use the update command
    const existingResume = await getLatestDbResume(interaction.user.id);
    if (existingResume && existingResume.length > 0) {
      return interaction.editReply(
        "Hmm, it seems like you've already uploaded a resume before. Please use the /update command instead to update it."
      );
    }
    const attachment = interaction.options.getAttachment("file");
    const pdfName = attachment.name;
    const buffer = await validatePdf(attachment);
    const pdfUrl = await saveS3Resume(Buffer.from(buffer), interaction.user.id);

    if (!pdfUrl) return interaction.editReply("Failed to upload PDF. 😔");

    const userId = interaction.user.id;
    //upload the pdf url to dynamodb
    await saveDbResume(pdfUrl, pdfName, userId, "v1");

    //Generate Hypothes.is annotation link
    const annotationLink = `https://via.hypothes.is/${pdfUrl}`;

    await interaction.editReply(
      `📝 Your PDF is ready for annotation: ${annotationLink}`
    );
  } catch (error) {
    console.error("Error processing PDF:", error);
    interaction.reply("An error occurred while processing your PDF. 😔");
  }
};

module.exports = { validateAndUploadPdf };
