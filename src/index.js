const { Client, IntentsBitField } = require("discord.js");
const { processPDF } = require("./controllers/reviewWithGemini");
const { validateAndUploadPdf } = require("./controllers/upload");
const { getAnnotations } = require("./controllers/getAnnotations");
const { updateResume } = require("./controllers/update");
const { getLatestResume } = require("./controllers/getLatestResume");

require("dotenv").config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`Logged in as ${c.user.username}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "review") {
    await processPDF(interaction);
  }

  if (interaction.commandName === "upload") {
    await validateAndUploadPdf(interaction);
  }

  if (interaction.commandName === "get_annotations") {
    console.log(interaction.options.getString("pdf_url"));
    const formattedResponse = await getAnnotations(
      interaction.options.getString("pdf_url")
    );
    interaction.reply(formattedResponse);
  }

  if (interaction.commandName === "update") {
    await updateResume(interaction);
  }

  if (interaction.commandName === "get_latest_resume") {
    await getLatestResume(interaction);
  }
});

client.on("error", console.error);
client.on("warn", console.warn);

client.login(process.env.BOT_TOKEN);
