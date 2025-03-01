const { updateDbResume, getLatestDbResume } = require("../aws/dynamo");
const { saveS3Resume } = require("../aws/s3");
const { compareTextDiff } = require("./helpers/getPdfDiff");
const { sendLongMessage } = require("./helpers/sendLongMessage");
const { validatePdf } = require("./helpers/validatePdf");
const { EmbedBuilder } = require("discord.js");

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

    const newHypothesisLink = `https://via.hypothes.is/${pdfUrl}`;

    if (!diff) {
      return interaction.editReply(
        `📝 Your Resume has been updated! Here's the new link for review: ${newHypothesisLink}`
      );
    }
    await createResumeDiffEmbed(initialResumeURL, pdfUrl, interaction);
    //follow up with the link to the new resume
    await interaction.followUp(
      `Here's the new link for review: ${newHypothesisLink}`
    );
  } catch (error) {
    console.error("Error updating resume:", error);
    interaction.editReply("An error occurred while updating your resume. 😔");
  }
};

const createResumeDiffEmbed = async (
  oldResumeURL,
  newResumeURL,
  interaction
) => {
  try {
    let { addedText, removedText } = await compareTextDiff(
      oldResumeURL,
      newResumeURL
    );
    //if the differences are too long, send it in multiple messages
    if (!addedText && !removedText) {
      return interaction.editReply("No changes were found in the resume.");
    }
    const embed = new EmbedBuilder()
      .setColor(0x800080)
      .setTitle("Resume Changes")
      .setDescription("See what was added and removed from your resume:")
      .addFields(
        {
          name: "🟢 Added",
          value: addedText || "No new content added.",
          inline: true,
        },
        {
          name: "🔴 Removed",
          value: removedText || "No content removed.",
          inline: true,
        }
      )
      .setFooter({ text: "ResuRalph 🤖 by @Lenny" });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error creating resume diff embed:", error);
    interaction.editReply(
      "An error occurred while comparing the resume differences. 😔"
    );
  }
};

// (async () => {
//   const testURL1 =
//     "https://resu-bot-bucket.s3.ca-central-1.amazonaws.com/uploads/323500516585897986/1740407078603.pdf";
//   const testURL2 =
//     "https://resu-bot-bucket.s3.ca-central-1.amazonaws.com/uploads/323500516585897986/1740668716343.pdf";

//   let diffs = await compareTextDiff(testURL1, testURL2);
//   console.log(diffs);
// })();

module.exports = { updateResume, createResumeDiffEmbed };
