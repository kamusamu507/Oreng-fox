const axios = require("axios");
const fs = require("fs");
const path = require("path");
module.exports = {
  config: {
    name: "alldl",
    aliases: ["autodl"],
    version: "1.7.2",
    author: "Nazrul",
    role: 0,
    description: "Auto-download media from any platform",
    category: "media",
    guide: { en: "Send any media link" }
  },
  onStart: async function({}) {},
  onChat: async function({ api, event }) {
    const url = event.body?.match(/https?:\/\/[^\s]+/)?.[0];
    if (!url) return;
    try {
      api.setMessageReaction("🦆", event.messageID, () => {}, true);
      const apiUrl = (await axios.get("https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json")).data.api;
      const { data } = await axios.get(`${apiUrl}/nazrul/alldlxx?url=${encodeURIComponent(url)}`);
      if (!data.url) throw new Error(data.error || "No download link found");
      const noticeMsg = await api.sendMessage(
        "Khara download kore dicchi!",
        event.threadID
      );
      const filePath = path.join(__dirname, `n_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: data.url,
        method: "GET",
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "*/*",
          "Connection": "keep-alive"
        }
      });
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      await api.sendMessage({
        body: `${data.t}\n🛠️ Platform: ${data.p}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);
      if (noticeMsg?.messageID) api.unsendMessage(noticeMsg.messageID);
      fs.unlink(filePath, () => {});
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (e) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.log(e.message);
    }
  }
};
