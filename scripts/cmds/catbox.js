const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

async function getUploadApiUrl() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json");
    return res.data.catbox || "https://catbox.moe/user/api.php";
  } catch {
    return "https://catbox.moe/user/api.php";
  }
}

async function handleCatboxUpload({ event, api, message }) {
  const { messageReply, messageID } = event;
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return message.reply("Please reply to an image or video.");
  }

  const fileUrl = messageReply.attachments[0].url;
  const ext = messageReply.attachments[0].type === "photo" ? ".jpg" : ".mp4";
  const filePath = path.join(__dirname, "temp" + ext);

  // React with 🕛 during upload
  api.setMessageReaction("🕛", messageID, () => {}, true);
  const loading = await message.reply("");

  setTimeout(() => {
    api.unsendMessage(loading.messageID);
  }, 5000);

  try {
    const uploadApiUrl = await getUploadApiUrl();

    const response = await axios.get(fileUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const upload = await axios.post(uploadApiUrl, form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(filePath);

    // ✅ React on success
    api.setMessageReaction("✅", messageID, () => {}, true);
    return message.reply(upload.data);
  } catch (err) {
    fs.existsSync(filePath) && fs.unlinkSync(filePath);
    // ❌ React on failure
    api.setMessageReaction("❌", messageID, () => {}, true);
    return message.reply("❌ Failed to upload to Catbox.");
  }
}

module.exports = {
  config: {
    name: "catbox",
    aliases: ["cb"],
    version: "1.3",
    author: "MaHU",
    countDown: 5,
    role: 0,
    shortDescription: "Upload media to catbox.moe",
    longDescription: "Upload replied image or video to catbox.moe and get link",
    category: "tools",
    guide: {
      en: "{pn} (reply to image/video)"
    }
  },

  onStart: async function ({ event, api, message }) {
    return handleCatboxUpload({ event, api, message });
  }
};
