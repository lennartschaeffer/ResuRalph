const createGeminiPrompt = (textContent) => {
  if (!textContent) {
    throw new Error("Please provide the text content to generate the prompt.");
  }

  const prompt = `
        IN LESS THAN 2000 CHARACTERS:
        Review this resume and provide feedback:\n\n${textContent}
        Use these principles as a base-line:
        1 - 𝐀𝐩𝐩𝐫𝐨𝐩𝐫𝐢𝐚𝐭𝐞 𝐇𝐲𝐩𝐞𝐫𝐥𝐢𝐧𝐤𝐬
    Portfolio Website (Must)
    Showcase Experience in Consumable Format (Github)
    No Facebook or Instagram Links

    2 - 𝐑𝐞𝐥𝐚𝐭𝐞𝐝 𝐒𝐤𝐢𝐥𝐥 & 𝐄𝐱𝐩𝐞𝐫𝐢𝐞𝐧𝐜𝐞 >>> 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧
    Unless Education is Extremely Exceptional (Top 3% institutions)

    3 - 𝐁𝐲𝐩𝐚𝐬𝐬 𝐭𝐡𝐞 𝐀𝐓𝐒
    Read 50 Job descriptions, and note commonly required skills. Add them to the resume.
    Bold - High frequency occurring skills.

    4 - 𝐋𝐞𝐚𝐫𝐧 𝐭𝐨 𝐰𝐫𝐢𝐭𝐞 𝐈𝐦𝐩𝐚𝐜𝐭 𝐒𝐭𝐚𝐭𝐞𝐦𝐞𝐧𝐭𝐬
    Statement Structure: Challenge -> Accomplishment -> Results
    Template: I developed X, which helped Y amount of people, rose their efficiency by Z%, resulting in reducing the cycle time of the entire department by Q%.

    5 - 𝐊𝐞𝐲𝐰𝐨𝐫𝐝𝐬 𝐢𝐬 𝐊𝐞𝐲
    Use the right keywords for your Job Role.
    Example: SDE roles use: developed, deployed, optimized, Built, Delivered.

    6 - 𝐋𝐞𝐚𝐫𝐧 𝐭𝐨 𝐰𝐫𝐢𝐭𝐞 𝐁𝐮𝐥𝐥𝐞𝐭 𝐏𝐨𝐢𝐧𝐭𝐬
    Read Job Descriptions (20+). Understand the company’s needs of the ideal candidate. Include similar language in your bullet points.

    7 - 𝐀𝐯𝐨𝐢𝐝 𝐭𝐨𝐨 𝐦𝐮𝐜𝐡 𝐰𝐡𝐢𝐭𝐞 𝐛𝐥𝐚𝐧𝐤 𝐬𝐩𝐚𝐜𝐞 𝐢𝐧 𝐲𝐨𝐮𝐫 𝐫𝐞𝐬𝐮𝐦𝐞
    Do not write half a line of content. Write to the full width of the resume. No half or 1/4th length. The main objective is to avoid white spaces. Half-length content leaves white spaces.

    8 - 𝐇𝐨𝐬𝐭 𝐲𝐨𝐮𝐫 𝐏𝐫𝐨𝐣𝐞𝐜𝐭𝐬
    Adds legitimacy to your story.

    9 - 𝐆𝐢𝐯𝐞 𝐍𝐢𝐜𝐤 𝐍𝐚𝐦𝐞𝐬 𝐓𝐨 𝐲𝐨𝐮𝐫 𝐏𝐫𝐨𝐣𝐞𝐜𝐭𝐬
    Adds to the curiosity. Makes it more interesting.

    10 - 𝐏𝐥𝐚𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐫𝐞𝐧𝐠𝐭𝐡
    If your education is not eye catchy (Big names). Then put it at the bottom. Excel in other departments and play those as your strength.

    11 - 𝐍𝐨 𝐞𝐬𝐬𝐚𝐲 𝐰𝐫𝐢𝐭𝐢𝐧𝐠 𝐡𝐞𝐫𝐞
    KISS - Keep It Short and Simple. No need to explain the entire story here. Do that in the interview.

    MAKE SURE THE RESPONSE IS LESS THAN 2000 CHARACTERS.
        `;

  return prompt;
};

module.exports = { createGeminiPrompt };
