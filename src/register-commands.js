require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  // new SlashCommandBuilder()
  //   .setName("review")
  //   .setDescription("Get an AI resume review")
  //   .addAttachmentOption((option) =>
  //     option
  //       .setName("file")
  //       .setDescription("Upload your resume as a PDF")
  //       .setRequired(true)
  //   ),
  new SlashCommandBuilder()
    .setName("upload")
    .setDescription("Upload your resume for review by other members")
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("Upload your resume as a PDF")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("get_annotations")
    .setDescription("Get the annotations made on your resume")
    .addStringOption((option) =>
      option
        .setName("pdf_url")
        .setDescription(
          "Right click on the latest resume link sent by ResuRalph and click Copy Link."
        )
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Update your current resume and see the changes")
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("Upload your resume as a PDF")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("show_diff")
        .setDescription(
          "Show differences between the latest uploaded resume and the previous one"
        )
    ),
  new SlashCommandBuilder()
    .setName("get_latest_resume")
    .setDescription("Retrieve the link to your latest uploaded resume"),

  new SlashCommandBuilder()
    .setName("get_resume_diff")
    .setDescription("Get the differences between two resumes")
    .addStringOption((option) =>
      option
        .setName("old_resume_url")
        .setDescription("The hypothes.is URL of the old resume")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("new_resume_url")
        .setDescription("The hypothes.is URL of the new resume")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

const botToken =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_BOT_TOKEN
    : process.env.BOT_TOKEN;

const clientId =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_CLIENT_ID
    : process.env.CLIENT_ID;

const rest = new REST({ version: "10" }).setToken(botToken);

const registerCommands = async () => {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("In Dev Mode");
    }
    console.log("Registering slash commands...");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log("Successfully registered slash commands!");
  } catch (error) {
    console.error(error);
  }
};

registerCommands();
