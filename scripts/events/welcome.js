const { getTime, drive } = global.utils;
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const moment = require("moment-timezone");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

function getNumberSuffix(n) {
  if (n % 10 === 1 && n % 100 !== 11) return "st";
  if (n % 10 === 2 && n % 100 !== 12) return "nd";
  if (n % 10 === 3 && n % 100 !== 13) return "rd";
  return "th";
}

module.exports = {
  config: {
    name: "welcome",
    version: "7.1",
    author: "Fahad Islam + Bold Text by Alamin",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const prefix = global.utils.getPrefix(threadID);
    const dataAddedParticipants = event.logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    // --- BOT JOIN ---
    if (dataAddedParticipants.some(u => u.userFbId == botID)) {
      const { nickNameBot } = global.GoatBot.config;
      if (nickNameBot) api.changeNickname(nickNameBot, threadID, botID);
      return setTimeout(() => {
        try {
          api.sendMessage(getLang("welcomeMessage", prefix), threadID);
        } catch {}
      }, 2000);
    }

    // --- USER JOIN ---
    if (!global.temp.welcomeEvent[threadID])
      global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
      try {
        const threadData = await threadsData.get(threadID);
        if (threadData.settings.sendWelcomeMessage === false) return;

        const newUsers = global.temp.welcomeEvent[threadID].dataAddedParticipants;
        const dataBanned = threadData.data.banned_ban || [];
        const usersToWelcome = newUsers.filter(u => !dataBanned.some(b => b.id == u.userFbId));
        if (!usersToWelcome.length) return;

        const tmpDir = path.join(__dirname, "cache");
        await fs.ensureDir(tmpDir);

        const backgrounds = [
          "https://files.catbox.moe/iywqeh.jpg",
          "https://files.catbox.moe/ilcdfk.jpg",
          "https://files.catbox.moe/9rr7hm.jpg",
          "https://files.catbox.moe/y54nii.jpg",
          "https://files.catbox.moe/n6auag.jpg",
          "https://files.catbox.moe/jhvwkx.jpg",
          "https://files.catbox.moe/2l0flj.jpg",
          "https://files.catbox.moe/szpilp.jpg",
          "https://files.catbox.moe/e107it.jpg",
          "https://files.catbox.moe/h4i47q.jpg",
          "https://files.catbox.moe/t3ftb4.jpg",
          "https://files.catbox.moe/94hdr6.jpeg",
          "https://files.catbox.moe/83atsf.jpeg",
          "https://files.catbox.moe/jv1xgp.jpg",
          "https://files.catbox.moe/bf7y0j.jpg"
        ];

        const avatarSize = 180;

        for (const user of usersToWelcome) {
          try {
            const avatarURL = `https://graph.facebook.com/${user.userFbId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const avatarPath = path.join(tmpDir, `avt_${user.userFbId}.png`);
            const avatarRes = await axios.get(avatarURL, { responseType: "arraybuffer" });
            await fs.writeFile(avatarPath, Buffer.from(avatarRes.data));

            const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            const bgPath = path.join(tmpDir, `bg_${user.userFbId}.jpg`);
            const bgRes = await axios.get(bgURL, { responseType: "arraybuffer" });
            await fs.writeFile(bgPath, Buffer.from(bgRes.data));

            const avatar = await loadImage(avatarPath);
            const bg = await loadImage(bgPath);
            const W = 983, H = 480;
            const canvas = createCanvas(W, H);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(bg, 0, 0, W, H);

            const ax = (W - avatarSize) / 2, ay = 40, r = avatarSize / 2;
            for (let i = 4; i >= 0; i--) {
              ctx.beginPath();
              ctx.arc(ax + r, ay + r, r + i * 4, 0, Math.PI * 2);
              const glow = ["#00ffff", "#00ccff", "#0099cc", "#005577"][i] || "#fff";
              ctx.strokeStyle = glow;
              ctx.lineWidth = 2;
              ctx.shadowColor = glow;
              ctx.shadowBlur = 20 + i * 4;
              ctx.stroke();
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(ax + r, ay + r, r, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, ax, ay, avatarSize, avatarSize);
            ctx.restore();

            const memberInfo = await api.getThreadInfo(threadID);
            const timeStr = moment().tz("Asia/Dhaka").format("[📅] hh:mm:ss A - DD/MM/YYYY - dddd");

            ctx.textAlign = "center";

            // 💠 BOLD FONT STYLE LIKE IMAGE
            ctx.font = "bold 45px Arial";
            ctx.fillStyle = "#00ffff";
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 25;
            ctx.fillText(`𝐇𝐞𝐥𝐥𝐨 ${user.fullName}`, W / 2, 280);

            ctx.font = "bold 35px Arial";
            ctx.fillStyle = "#ff99cc";
            ctx.shadowColor = "#ff66cc";
            ctx.shadowBlur = 20;
            ctx.fillText(`𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ${threadData.threadName}`, W / 2, 330);

            ctx.font = "bold 32px Arial";
            ctx.fillStyle = "#ffff99";
            ctx.shadowColor = "#ffcc00";
            ctx.shadowBlur = 25;
            ctx.fillText(
              `𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 ${memberInfo.participantIDs.length}${getNumberSuffix(memberInfo.participantIDs.length)} 𝐦𝐞𝐦𝐛𝐞𝐫 🎉`,
              W / 2,
              375
            );

            ctx.font = "25px Arial";
            ctx.fillStyle = "#bbbbbb";
            ctx.shadowBlur = 0;
            ctx.fillText("━━━━━━━━━━━━━━━━", W / 2, 410);

            ctx.font = "20px Arial";
            ctx.fillStyle = "#aaaaaa";
            ctx.fillText(timeStr, W / 2, 450);

            const outputPath = path.join(tmpDir, `welcome_card_${user.userFbId}.png`);
            await fs.writeFile(outputPath, canvas.toBuffer("image/png"));

            await api.sendMessage({
              body: `👋 𝐇𝐞𝐥𝐥𝐨 ${user.fullName}\n🎀 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ${threadData.threadName}\n🎇 𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 ${memberInfo.participantIDs.length}${getNumberSuffix(memberInfo.participantIDs.length)} 𝐦𝐞𝐦𝐛𝐞𝐫 🎉\n━━━━━━━━━━━━━━━━\n${timeStr}`,
              attachment: fs.createReadStream(outputPath),
              mentions: [{ tag: user.fullName, id: user.userFbId }]
            }, threadID);

            await fs.unlink(avatarPath);
            await fs.unlink(bgPath);
            setTimeout(() => fs.unlink(outputPath).catch(() => {}), 60000);
          } catch (err) {
            console.error(err);
          }
        }
      } catch (err) {
        console.error(err);
      }
      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
