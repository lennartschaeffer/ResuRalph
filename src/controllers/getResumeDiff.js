const { createResumeDiffEmbed } = require("./update");

const getResumeDiff = async (interaction) => {
  try {
    await interaction.deferReply();

    const oldResumeURL = interaction.options.getString("old_resume_url");
    const newResumeURL = interaction.options.getString("new_resume_url");

    //remove the hypothesis prefix to get the proper PDF URL
    const cleanedOldURL = oldResumeURL.replace("https://via.hypothes.is/", "");
    const cleanedNewURL = newResumeURL.replace("https://via.hypothes.is/", "");

    await createResumeDiffEmbed(cleanedOldURL, cleanedNewURL, interaction);
  } catch (error) {
    console.error("Error updating resume:", error);
    interaction.editReply(
      "An error occurred while getting the resume diff. 😔"
    );
  }
};

module.exports = { getResumeDiff };

// https://via.hypothes.is/https://resu-bot-bucket.s3.ca-central-1.amazonaws.com/uploads/323500516585897986/1740407078603.pdf

// https://via.hypothes.is/https://resu-bot-bucket.s3.ca-central-1.amazonaws.com/uploads/323500516585897986/1740668716343.pdf
