const { default: axios } = require("axios");

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
    let resultString = "Here's the annotations:\n";
    console.log(annotations.rows);
    annotations.rows.forEach((annotation) => {
      const textString = annotation.text;
      const userString = annotation.user
        ? `by ${annotation.user}`
        : "by an anonymous user";
      resultString += `📝 ${textString} \n - ${userString
        .replace("acct:", "")
        .replace("@hypothes.is", "")}\n`;
    });

    return resultString;
  } catch (error) {
    console.error("Error formatting annotations:", error);
  }
};

module.exports = { getAnnotations };
