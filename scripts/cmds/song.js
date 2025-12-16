const axios = require("axios");
const fs = require('fs');
const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
};

module.exports = {
  config: {
    name: "song",
    version: "1.1.5",
    aliases: ["music", "play"],
    author: "dipto",
    countDown: 5,
    role: 0,
    noPrefix: true,
    description: {
      en: "Download audio from YouTube"
    },
    category: "media",
    guide: {
      en: "{pn} [<song name>|<song link>]\nExample:\n{pn} chipi chipi chapa chapa"
    }
  },

  onStart: async ({ api, args, event, commandName, message }) => {
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    let videoID;
    const urlYtb = checkurl.test(args[0]);

    if (urlYtb) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;
      const { data: { title, downloadLink } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`);
      return api.sendMessage({
        body: title,
        attachment: await dipto(downloadLink, 'audio.mp3')
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
    }

    let keyWord = args.join(" ");
    keyWord = keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;
    const maxResults = 6;
    let result;
    try {
      result = ((await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${keyWord}`)).data).slice(0, maxResults);
    } catch (err) {
      return api.sendMessage("❌ An error occurred: " + err.message, event.threadID, event.messageID);
    }
    if (result.length == 0)
      return api.sendMessage("⭕ No search results match the keyword: " + keyWord, event.threadID, event.messageID);

    let msg = "";
    let i = 1;
    const thumbnails = [];

    // Helper function: Convert digit(s) to bold serif numbers
    function toBoldSerifNumber(num) {
      const nums = ['𝟎','𝟏','𝟐','𝟑','𝟒','𝟓','𝟔','𝟕','𝟖','𝟗'];
      return String(num).split('').map(d => nums[parseInt(d)]).join('');
    }

    // Helper function: Convert text A-Z a-z 0-9 to bold serif Unicode
    function toBoldSerifText(text) {
      const boldLower = [
        "𝐚","𝐛","𝐜","𝐝","𝐞","𝐟","𝐠","𝐡","𝐢","𝐣","𝐤","𝐥","𝐦",
        "𝐧","𝐨","𝐩","𝐪","𝐫","𝐬","𝐭","𝐮","𝐯","𝐰","𝐱","𝐲","𝐳"
      ];
      const boldUpper = [
        "𝐀","𝐁","𝐂","𝐃","𝐄","𝐅","𝐆","𝐇","𝐈","𝐉","𝐊","𝐋","𝐌",
        "𝐍","𝐎","𝐏","𝐐","𝐑","𝐒","𝐓","𝐔","𝐕","𝐖","𝐗","𝐘","𝐙"
      ];
      return text.split('').map(ch => {
        if ('a' <= ch && ch <= 'z') return boldLower[ch.charCodeAt(0) - 97];
        if ('A' <= ch && ch <= 'Z') return boldUpper[ch.charCodeAt(0) - 65];
        if ('0' <= ch && ch <= '9') return toBoldSerifNumber(ch);
        return ch;
      }).join('');
    }

    for (const info of result) {
      thumbnails.push(diptoSt(info.thumbnail, 'photo.jpg'));

      msg += `${toBoldSerifNumber(i++)}. ${toBoldSerifText(info.title)}\n`;
      msg += `${toBoldSerifText("Time")}: ${toBoldSerifText(info.time)}\n`;
      msg += `${toBoldSerifText("Channel")}: ${toBoldSerifText(info.channel.name)}\n\n`;
    }
    api.sendMessage({
      body: msg + toBoldSerifText("Reply to this message with a number to listen."),
      attachment: await Promise.all(thumbnails)
    }, event.threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        author: event.senderID,
        result
      });
    }, event.messageID);
  },

  onReply: async ({ event, api, Reply }) => {
    try {
      const { result } = Reply;
      const choice = parseInt(event.body);
      if (!isNaN(choice) && choice <= result.length && choice > 0) {
        const infoChoice = result[choice - 1];
        const idvideo = infoChoice.id;
        const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`);
        await api.unsendMessage(Reply.messageID);
        await api.sendMessage({
          body: `• Title: ${title}\n• Quality: ${quality}`,
          attachment: await dipto(downloadLink, 'audio.mp3')
        }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
      } else {
        api.sendMessage("Invalid choice. Please enter a number between 1 and 6.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.log(error);
      api.sendMessage("⭕ Sorry, audio size may be larger than allowed.\n", event.threadID, event.messageID);
    }
  },

  onChat: async function ({ event, message, api, commandName }) {
    const body = event.body?.toLowerCase();
    const triggers = ["song", "music", "play"];

    if (body && triggers.some(trigger => body.startsWith(trigger))) {
      const slicedArgs = body.split(" ").slice(1);
      event.body = slicedArgs.join(" ");
      await module.exports.onStart({
        api,
        args: slicedArgs,
        event,
        commandName,
        message
      });
    }
  }
};

async function dipto(url, pathName) {
  try {
    const response = (await axios.get(url, {
      responseType: "arraybuffer"
    })).data;

    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  }
  catch (err) {
    throw err;
  }
}

async function diptoSt(url, pathName) {
  try {
    const response = await axios.get(url, {
      responseType: "stream"
    });
    response.data.path = pathName;
    return response.data;
  }
  catch (err) {
    throw err;
  }
}
