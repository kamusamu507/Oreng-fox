const { getStreamFromURL } = global.utils;
module.exports = {
  config: {
    name: "eyes",
    version: 2.1,
    author: "Jani nh ke manger nati cng marche 🙂 Modified by tom",
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
    const triggers = ["eyes", `${prefix}eyes`];
    if (!triggers.includes(body)) return;
    await module.exports.sendOwnerInfo({ event, message, usersData });
  },
  sendOwnerInfo: async function ({ event, message, usersData }) {
    const videoURL = "https://files.catbox.moe/jumr2j.mp4";
    const attachment = await getStreamFromURL(videoURL);
    const id = event.senderID;
    const userData = usersData ? await usersData.get(id) : null;
    const name = userData?.name || "User";
    const mentions = [{ id, tag: name }];
    const info = "𝐌𝐲 𝐊𝐚𝐥𝐮𝐚𝐚 𝐛𝐨𝐬𝐬'𝐬 𝐞𝐲𝐞𝐬!";
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
