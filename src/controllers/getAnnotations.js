const { default: axios, get } = require("axios");

const getAnnotations = async (pdfUrl) => {
  try {
    const API_URL = `https://api.hypothes.is/api/search?uri=${encodeURIComponent(
      pdfUrl
    )}`;
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

    console.log(resultString);
    return resultString;
  } catch (error) {
    console.error("Error formatting annotations:", error);
  }
};

getAnnotations();

module.exports = { getAnnotations };
