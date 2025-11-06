const fs = require("fs-extra");
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "rules",
    version: "1.2",
    author: "EREN & Luciferian",
    countDown: 5,
    role: 0,
    category: "info",
    guide: {
      en: "{pn} / rules",
    },
    priority: 1,
  },

  onStart: async function ({ message, args }) {
    await this.sendRules(message);
  },

  onChat: async function ({ event, message }) {
    if (event.body.toLowerCase().startsWith("rules")) {
      await this.sendRules(message);
    }
  },

  sendRules: async function (message) {
    let rulesMsg = `
𝟏. 𝐅𝐫𝐢𝐞𝐧𝐝𝐥𝐲 𝐚𝐧𝐝 𝐠𝐨𝐨𝐝 𝐛𝐞𝐡𝐚𝐯𝐢𝐨𝐫
𝟐. 𝐃𝐨𝐧'𝐭 𝐬𝐩𝐚𝐦 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩
𝟑. 𝐁𝐭𝐬 𝐭𝐨𝐩𝐢𝐜 & 𝟏𝟖+ 𝐜𝐨𝐧𝐭𝐞𝐧𝐭 𝐭𝐨𝐭𝐚𝐥𝐥𝐲 𝐨𝐟𝐟
𝟒. 𝐠𝐫𝐨𝐮𝐩 𝐩𝐫𝐨𝐦𝐨𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐨𝐭𝐡𝐞𝐫 𝐠𝐫𝐨𝐮𝐩 𝐭𝐨𝐩𝐢𝐜 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰 𝐈𝐈
𝟓. 𝐧𝐨 𝐡𝐚𝐭𝐞 𝐬𝐩𝐞𝐞𝐜𝐡 𝐨𝐫 𝐛𝐮𝐥𝐥𝐲𝐢𝐧𝐠
𝟔. 𝐁𝐫𝐚𝐳𝐢𝐥 & 𝐀𝐫𝐠𝐞𝐧𝐭𝐢𝐧𝐚 𝐧𝐢𝐲𝐞 𝐜𝐡𝐚𝐩𝐫𝐢 𝐠𝐢𝐫𝐢 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰 𝐈𝐈
𝟕. 𝐊𝐨𝐧𝐨 𝐫𝐨𝐤𝐨𝐦 𝐛𝐚𝐝 𝐰𝐨𝐫𝐝𝐬 𝐚𝐥𝐥𝐨𝐰 𝐧𝐚
𝟖. 𝐁𝐮𝐥𝐥𝐲 𝐤𝐨𝐫𝐚 𝐚𝐥𝐥𝐨𝐰 𝐧𝐚, 𝐛𝐮𝐥𝐥𝐲𝐢𝐧𝐠 𝐭𝐨𝐩𝐢𝐜 𝐚𝐥𝐥𝐨𝐰 𝐧𝐡 𝐈𝐈

• 𝐀𝐝𝐦𝐢𝐧: 𝐋𝐮𝐜𝐢𝐟ē𝐫𝐢𝐚𝐧 ᥫ᭡
    `;

    return message.reply({
      body: rulesMsg,
    });
  },
};
