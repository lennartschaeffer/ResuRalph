const { updateDbResume, getLatestDbResume } = require("../aws/dynamo");
const { saveS3Resume } = require("../aws/s3");
const { compareTextDiff } = require("./helpers/getResumeDiff");
const { sendLongMessage } = require("./helpers/sendLongMessage");
const { validatePdf } = require("./helpers/validatePdf");

const updateResume = async (interaction) => {
  try {
    await interaction.deferReply();

    const diff = interaction.options.getBoolean("show_diff");

    const attachment = interaction.options.getAttachment("file");
    const buffer = await validatePdf(attachment, interaction);
    const { key, pdfUrl } = await saveS3Resume(
      Buffer.from(buffer),
      interaction.user.id
    );
    const pdfName = attachment.name;

    if (!pdfUrl) return interaction.editReply("Failed to upload PDF. 😔");

    const userId = interaction.user.id;

    //get latest resume version before we update for comparison
    const latestResume = await getLatestDbResume(userId);
    if (!latestResume || latestResume.length === 0) {
      console.error("No resume found for this user");
      return interaction.editReply(
        "It seems you haven't uploaded a resume yet. Please upload one first before updating."
      );
    }
    const initialResumeURL = latestResume[0].resume_url.S;
    await updateDbResume(userId, pdfUrl, pdfName, key);

    let differences = await compareTextDiff(initialResumeURL, pdfUrl);

    const newHypothesisLink = `https://via.hypothes.is/${pdfUrl}`;

    if (!diff) {
      return interaction.editReply(
        `📝 Your Resume has been updated! Here's the new link for review: ${newHypothesisLink}`
      );
    }
    if (differences.length < 1900) {
      interaction.editReply(
        `📝 Your Resume has been updated! Here's the new link for review: ${newHypothesisLink}.\nChanges:\n${differences}`
      );
    } else {
      interaction.followUp(
        `📝 Your Resume has been updated! Here's the new link for review: ${newHypothesisLink}.\nChanges:\n`
      );
      await sendLongMessage(interaction, differences);
    }
  } catch (error) {
    console.error("Error updating resume:", error);
    interaction.editReply("An error occurred while updating your resume. 😔");
  }
};

module.exports = { updateResume };
