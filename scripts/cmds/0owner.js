const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "owner",
    version: 2.1,
    author: "Jani nh ke manger nati cng marche 🙂",
    longDescription: "Info about bot and owner",
    category: "Special",
    guide: {
      en: "{p}owner or just type owner"
    },
    usePrefix: false
  },

  onStart: async function (context) {
    await module.exports.sendOwnerInfo(context);
  },

  onChat: async function ({ event, message, usersData }) {
    const prefix = global.GoatBot.config.prefix || "";
    const body = (event.body || "").toLowerCase().trim();
    const triggers = ["owner", `${prefix}owner`];
    if (!triggers.includes(body)) return;
    await module.exports.sendOwnerInfo({ event, message, usersData });
  },

  sendOwnerInfo: async function ({ event, message, usersData }) {
    const videoURL = "https://files.catbox.moe/nt29t4.mp4";
    const attachment = await getStreamFromURL(videoURL);

    const id = event.senderID;
    const userData = usersData ? await usersData.get(id) : null;
    const name = userData?.name || "User";
    const mentions = [{ id, tag: name }];

    const info = `
╭─❖─────────────❖─╮
│   │     𝗢𝘄𝗻𝗲𝗿 𝗶𝗻𝗳𝗼     │
├─────────────────────┤
│ 👤 𝗡𝗮𝗺𝗲       : 𝐋𝐮𝐜𝐢𝐟ē𝐫𝐢𝐚𝐧 𝐈𝐈
│ 📍 𝗙𝗿𝗼𝗺        : 𝐘𝐨𝐮𝐫 𝐇𝐞𝐚𝐫𝐭
│ 🎓 𝗖𝗹𝗮𝘀𝘀       : 𝟱
│ 🎂 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆  : 𝟵 𝗡𝗼𝘃..
│ 🔞 𝗔𝗴𝗲    : 𝐃𝐨𝐞𝐬𝐧'𝐭 𝐦𝐚𝐭𝐭𝐞𝐫
│ 📏 𝗛𝗲𝗶𝗴𝗵𝘁     : 𝐔𝐧𝐤𝐧𝐨𝐰𝐧
│ 🕌 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻 : 𝐈𝐬𝐥𝐚𝐦
├─────────────────────┤
│ 🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸  : 𝐡𝐭𝐭𝐩𝐬://𝐦.𝐦𝐞/𝐟𝟑𝐜𝐤𝐮𝐔 🙂💋
│ 📸 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺 : 𝐥𝐨𝐚𝐝𝐢𝗻𝗴
│ ❤️ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻  : 𝐒𝐞𝐜𝐫𝐞𝐭
│ 🩸 𝗕𝗹𝗼𝗼𝗱 𝗚𝗿𝗼𝘂𝗽 : 𝐍𝐨𝐭 𝐬𝐮𝐫𝐞
╰─❖─────────────❖─╯
    `.trim();

    if (message && typeof message.reply === "function") {
      message.reply({
        body: info,
        attachment,
        mentions
      });
    } else if (event && typeof global.GoatBot.api.sendMessage === "function") {
      global.GoatBot.api.sendMessage(
        { body: info, attachment, mentions },
        event.threadID
      );
    }
  }
};
