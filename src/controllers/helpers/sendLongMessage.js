const sendLongMessage = async (interaction, text) => {
  const maxLength = 2000;
  for (let i = 0; i < text.length; i += maxLength) {
    await interaction.followUp(text.substring(i, i + maxLength));
  }
};

module.exports = { sendLongMessage };
