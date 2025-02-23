const { default: axios, get } = require("axios");
const { sendLongMessage } = require("./helpers/sendLongMessage");

const getAnnotations = async (interaction) => {
  await interaction.deferReply();
  const pdfUrl = interaction.options.getString("pdf_url");
  const formattedResponse = await getAnnotationsFromHypothesis(pdfUrl);
  //if the response is too long, send it in multiple messages
  if (formattedResponse.length >= 2000) {
    await sendLongMessage(interaction, formattedResponse);
    return;
  }
  interaction.editReply(formattedResponse);
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

    const annotations = res.data;
    const formattedAnnotations = formatAnnotations(annotations);
    return formattedAnnotations;
  } catch (error) {
    console.error("Error processing PDF:", error);
    return "An error occurred while fetching annotations";
  }
};

const formatAnnotations = (annotations) => {
  try {
    //if theres no annotations, return a message saying so
    if (annotations.total === 0) {
      return "No annotations Yet!";
    }
    let resultString = "Here's the annotations:\n";
    annotations.rows.forEach((annotation) => {
      annotation.target.forEach((target) => {
        if (target.selector && target.selector[1]) {
          resultString += `📄 *${target.selector[1].exact}*\n`;
        }
      });
      resultString += `💭 ${annotation.text}\n`;
      resultString += `👤 by ${annotation.user
        .replace("acct:", "")
        .replace("@hypothes.is", "")}\n`;
      resultString += "\n";
    });

    // //if the annotations are too long, ie greater than 2000, use sendLongMessage
    // if (resultString.length > 2000) {
    //   resultString = resultString.slice(0, 1900);
    // }
    // //append a message saying the message exceeds character limit
    // if (resultString.length === 1900) {
    //   resultString +=
    //     "\n📝 Maximum character limit exceeded. See link for full annotations.";
    // }

    return resultString;
  } catch (error) {
    console.error("Error formatting annotations:", error);
  }
};

module.exports = { getAnnotations };
