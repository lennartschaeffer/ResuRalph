const { default: axios, get } = require("axios");
const { sendLongMessage } = require("./helpers/sendLongMessage");
const { EmbedBuilder } = require("discord.js");

const getAnnotations = async (interaction) => {
  await interaction.deferReply();
  const pdfUrl = interaction.options.getString("pdf_url");
  const hypothesisAnnotations = await getAnnotationsFromHypothesis(pdfUrl);
  if (!hypothesisAnnotations) {
    return interaction.editReply(
      "An error occurred on Hypothes.is's end. Please try again later or visit the link instead to see annotations 😔"
    );
  }
  await formatAnnotations(hypothesisAnnotations, interaction);
};

const getAnnotationsFromHypothesis = async (pdfUrl) => {
  try {
    const API_URL = `https://api.hypothes.is/api/search?uri=${encodeURIComponent(
      pdfUrl
    )}&limit=100&order=asc`;
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HYPOTHESIS_API_KEY}`,
      },
    });
    //validate the response
    if (!res.data) {
      return null;
    }
    const annotations = res.data;
    return annotations;
  } catch (error) {
    console.error("Error processing PDF:", error);
    return "An error occurred while fetching annotations from Hypothesis. 😔";
  }
};

const formatAnnotations = async (annotations, interaction) => {
  try {
    //if theres no annotations, return a message saying so
    if (annotations.total === 0) {
      const embed = new EmbedBuilder()
        .setColor(0xffff00)
        .setTitle("No Annotations Yet!")
        .setDescription("No annotations were currently found for this resume.")
        .setFooter({ text: "ResuRalph 🤖 by @Lenny" });
      return interaction.editReply({ embeds: [embed] });
    }
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Resume Feedback")
      .setDescription("Here are the annotations for your resume:")
      .setFooter({ text: "ResuRalph 🤖 by @Lenny" });

    let fieldsAdded = 0;
    const fields = [];

    for (const annotation of annotations.rows) {
      if (fieldsAdded >= 25) {
        break;
      } // max fields for an embed is 25
      const field = {
        name: ``,
        value: "",
        inline: false,
      };
      annotation.target.forEach((target) => {
        if (target.selector && target.selector[1]) {
          let resumeText = target.selector[1].exact;
          if (resumeText.length >= 240) {
            resumeText = resumeText.substring(0, 240) + "...";
          }
          field.name = `📄 *${resumeText}*`;
        }
      });
      field.value = `💭 ${annotation.text}\n`;
      const user = `👤 by ${annotation.user
        .replace("acct:", "")
        .replace("@hypothes.is", "")}\n──────────────`;
      field.value += user;
      fields.push(field);
      fieldsAdded++;
    }
    embed.addFields(fields);
    await interaction.editReply({ embeds: [embed] });

    if (annotations.total > 25) {
      //filter the remaining annotations
      const remainingAnnotations = annotations.rows.slice(
        fieldsAdded,
        annotations.rows.length
      );
      await sendAdditionalFields(remainingAnnotations, interaction);
    }
  } catch (error) {
    console.error("Error formatting annotations:", error);
  }
};

const sendAdditionalFields = async (annotations, interaction) => {
  if (annotations.length > 25) {
    await interaction.editReply(
      "Looks like there are over 50 annotations! Please check the Hypothesis link for more details."
    );
    return;
  }
  console.log("there are more than 25 annotations");
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Feedback Cont'd")
    .setDescription("Additional annotations for your resume:")
    .setFooter({ text: "ResuRalph by @Lenny" });
  const fields = [];
  for (const annotation of annotations) {
    const field = {
      name: ``,
      value: "",
      inline: false,
    };
    annotation.target.forEach((target) => {
      if (target.selector && target.selector[1]) {
        let resumeText = target.selector[1].exact;
        if (resumeText.length >= 240) {
          resumeText = resumeText.substring(0, 240) + "...";
        }
        field.name = `📄 *${resumeText}*`;
      }
    });
    field.value = `💭 ${annotation.text}\n`;
    const user = `👤 by ${annotation.user
      .replace("acct:", "")
      .replace("@hypothes.is", "")}\n──────────────`;
    field.value += user;
    fields.push(field);
  }

  embed.addFields(fields);
  await interaction.followUp({ embeds: [embed] });
};

module.exports = { getAnnotations };
