const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "pend", "pn"],
    version: "2.0.1",
    author: "♡ Nazrul ♡ + Fixed by Alamin",
    countDown: 5,
    role: 1,
    shortDescription: "Handle pending requests",
    longDescription: "Approve or reject pending user or group requests",
    category: "utility",
    guide: {
      en: "{pn} [user/thread/all]\nReply with group number to approve\nType 'c' to cancel"
    }
  },

  // ✅ reply system compatible with ST bot
  onReply: async function ({ api, event, Reply }) {
    const { author, pending, messageID } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const { body, threadID } = event;

    // Cancel
    if (body.trim().toLowerCase() === "c") {
      try {
        await api.unsendMessage(messageID);
        return api.sendMessage("❌ Operation has been canceled!", threadID);
      } catch {
        return;
      }
    }

    const indexes = body.split(/\s+/).map(Number);
    if (isNaN(indexes[0])) {
      return api.sendMessage("⚠ Invalid input! Please try again.", threadID);
    }

    let count = 0;
    for (const idx of indexes) {
      if (idx <= 0 || idx > pending.length) continue;
      const group = pending[idx - 1];

      try {
        await api.sendMessage(
          `╭━「 ✅ 𝐆𝐫𝐨𝐮𝐩 𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝 」
┃📍 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: ! 
┃👥 𝐓𝐡𝐫𝐞𝐚𝐝 𝐏𝐫𝐞𝐟𝐢𝐱: !
┃🧸 𝐒𝐭𝐚𝐭𝐮𝐬: Connected 🎉
╰━━━━━━━━━━━━━╮
╭─❍ 𝐁𝐨𝐭 𝐁𝐲: 𝐋𝐮𝐜𝐢𝐟ē𝐫𝐢𝐚𝐧 𝐙𝐞𝐭𝐬ū 𝐈𝐈
┃🌐 FB: https://m.me/f3ckuU
╰━━━━━━━━━━━━━╯`,
          group.threadID
        );

        await api.changeNickname(
          `${global.GoatBot.config.nickNameBot || "𝗕𝗔'𝗕𝗬 くめ"}`,
          group.threadID,
          api.getCurrentUserID()
        );
        count++;
      } catch (err) {
        console.error("❌ Failed to approve:", err.message);
      }
    }

    // cleanup
    for (const idx of indexes.sort((a, b) => b - a)) {
      if (idx > 0 && idx <= pending.length) pending.splice(idx - 1, 1);
    }

    return api.sendMessage(`✅ | [ Successfully ] 🎉 Approved ${count} Groups ✨!`, threadID);
  },

  // ✅ onStart instead of onRun (for ST bot)
  onStart: async function ({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const adminBot = global.GoatBot.config.adminBot;

    // permission check
    if (!adminBot.includes(senderID)) {
      return api.sendMessage("⚠ You have no permission to use this command!", threadID);
    }

    const type = args[0]?.toLowerCase();
    if (!type) {
      return api.sendMessage("Usage: pending [user/thread/all]", threadID);
    }

    try {
      const spam = (await api.getThreadList(100, null, ["OTHER"])) || [];
      const pending = (await api.getThreadList(100, null, ["PENDING"])) || [];
      const list = [...spam, ...pending];
      let filteredList = [];

      if (type.startsWith("u")) filteredList = list.filter((t) => !t.isGroup);
      else if (type.startsWith("t")) filteredList = list.filter((t) => t.isGroup);
      else if (type === "all") filteredList = list;

      if (filteredList.length === 0)
        return api.sendMessage("⚠ No pending requests found!", threadID);

      let msg = "";
      let index = 1;

      for (const single of filteredList) {
        const name =
          single.name || (await usersData.getName(single.threadID)) || "Unknown";
        msg += `[ ${index} ] ${name}\n`;
        index++;
      }

      msg += `\n🦋 Reply with the correct group number to approve!\n✨ Reply with "c" to Cancel.\n`;

      return api.sendMessage(
        `✨ | [ Pending ${type.charAt(0).toUpperCase() + type.slice(1)} List ] ✨\n\n${msg}`,
        threadID,
        (error, info) => {
          if (error) return console.error(error);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            pending: filteredList
          });
        },
        messageID
      );
    } catch (error) {
      console.error("❌ Pending fetch error:", error);
      return api.sendMessage(
        `⚠ Failed to retrieve pending list. Please try again later.`,
        threadID
      );
    }
  }
};
