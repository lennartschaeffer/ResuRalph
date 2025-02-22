const { getLatestDbResume } = require("../aws/dynamo");

const getLatestResume = async (interaction) => {
  try {
    await interaction.deferReply();
    console.log(interaction.user.id);

    const latestResume = await getLatestDbResume(interaction.user.id);

    if (!latestResume || latestResume.length === 0) {
      return interaction.editReply(
        "It seems you haven't uploaded a resume yet. Please upload one first before requesting the latest one."
      );
    }
    const latestResumeURL = latestResume[0].resume_url.S;
    const hypothesisURL = `https://via.hypothes.is/${latestResumeURL}`;
    interaction.editReply(
      `📝 Here's the link to your latest resume: ${hypothesisURL}`
    );
  } catch (error) {
    console.error("Error getting latest resume:", error);
    interaction.editReply("An error occurred while getting your resume. 😔");
  }
};

module.exports = { getLatestResume };
