const { Client, IntentsBitField } = require("discord.js");
const { processPDF } = require("./controllers/reviewWithGemini");
const { validateAndUploadPdf } = require("./controllers/upload");
const { getAnnotations } = require("./controllers/getAnnotations");
const { updateResume } = require("./controllers/update");
const { getLatestResume } = require("./controllers/getLatestResume");
const { getResumeDiff } = require("./controllers/getResumeDiff");

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

  switch (interaction.commandName) {
    case "review":
      await processPDF(interaction);
      break;
    case "upload":
      await validateAndUploadPdf(interaction);
      break;
    case "get_annotations":
      await getAnnotations(interaction);
      break;
    case "update":
      await updateResume(interaction);
      break;
    case "get_latest_resume":
      await getLatestResume(interaction);
      break;
    case "get_resume_diff":
      await getResumeDiff(interaction);
      break;
  }
});

client.on("error", console.error);
client.on("warn", console.warn);

const botToken =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_BOT_TOKEN
    : process.env.BOT_TOKEN;

client.login(botToken);
