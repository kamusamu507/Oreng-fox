const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    version: "2.4.70",
    role: 0,
    countDown: 5,
    author: "ST | Sheikh Tamim + Modified by Alamin × luciferian",
    description: "Displays all available commands and their categories, with simple search suggestions.",
    category: "help"
  },

  onStart: async ({ api, event, args, threadsData, prefix }) => {
    const cmdsFolderPath = path.join(__dirname, ".");
    const files = fs.readdirSync(cmdsFolderPath).filter(file => file.endsWith(".js"));

    const sendMessage = async (message, threadID, messageID = null) => {
      try {
        return await api.sendMessage(message, threadID, messageID);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };

    // 🗂️ Get all categories, clean duplicates, and remove "ST_" prefixes
    const getCategories = () => {
      const categories = {};
      for (const file of files) {
        try {
          const command = require(path.join(cmdsFolderPath, file));
          if (!command.config) continue;
          let categoryName = command.config.category || "Uncategorized";
          categoryName = categoryName.replace(/^ST[_-]/i, "").trim();
          categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

          if (!categories[categoryName]) categories[categoryName] = [];
          categories[categoryName].push(command.config);
        } catch {}
      }
      return categories;
    };

    // 🧩 Detect Prefix
    let threadPrefix = prefix || global.GoatBot.config.prefix;
    if (threadsData && threadsData.get) {
      const data = await threadsData.get(event.threadID);
      if (data && data.prefix) threadPrefix = data.prefix;
    }

    try {
      // 🔍 SEARCH MODE
      if (args[0] && !args[0].match(/^\d+$/)) {
        const commandName = args[0].toLowerCase();

        const allCommands = files
          .map(file => {
            try {
              return require(path.join(cmdsFolderPath, file));
            } catch {
              return null;
            }
          })
          .filter(cmd => cmd && cmd.config);

        const command = allCommands.find(
          cmd =>
            cmd.config.name.toLowerCase() === commandName ||
            (cmd.config.aliases && cmd.config.aliases.includes(commandName))
        );

        if (command) {
          const c = command.config;
          let commandDetails = `━━━━━━━━━━━━━━\n`;
          commandDetails += `⚙️ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝘿𝙀𝙏𝘼𝙄𝙇𝙎\n`;
          commandDetails += `╭─╼━━━━━━━━╾─╮\n`;
          commandDetails += `│ ⚡ Name: ${c.name}\n`;
          commandDetails += `│ 📝 Version: ${c.version || "N/A"}\n`;
          commandDetails += `│ 👤 Author: ${c.author || "Unknown"}\n`;
          commandDetails += `│ 🔐 Role: ${c.role ?? "N/A"}\n`;
          commandDetails += `│ 📂 Category: ${c.category || "Uncategorized"}\n`;
          commandDetails += `│ 💎 Premium: ${c.premium ? "✅ Required" : "❌ Not Required"}\n`;
          commandDetails += `│ ⏱️ Cooldown: ${c.countDown || 0}s\n`;
          if (c.aliases && c.aliases.length > 0)
            commandDetails += `│ 🔄 Aliases: ${c.aliases.join(", ")}\n`;
          commandDetails += `╰─━━━━━━━━━╾─╯\n`;
          commandDetails += `📋 Description:\n${c.description || "No description"}\n`;
          commandDetails += `📚 Usage: ${
            c.guide
              ? typeof c.guide === "string"
                ? c.guide.replace(/{pn}/g, `${threadPrefix}${c.name}`)
                : c.guide.en?.replace(/{pn}/g, `${threadPrefix}${c.name}`) || "No guide"
              : "No guide"
          }\n`;
          commandDetails += `━━━━━━━━━━━━━━\n💫 ST_BOT Command Info`;
          return sendMessage(commandDetails, event.threadID);
        } else {
          const allCommandsList = allCommands.map(cmd => cmd.config.name.toLowerCase());
          const similar = allCommandsList.filter(n => n.includes(commandName)).slice(0, 5);
          if (similar.length > 0) {
            return sendMessage(
              `❌ No exact command found for "${commandName}".\n\n🤔 Did you mean:\n${similar
                .map(s => `• ${s}`)
                .join("\n")}`,
              event.threadID
            );
          } else {
            return sendMessage(`❌ No command found named "${commandName}".`, event.threadID);
          }
        }
      }

      // 🧭 SHOW ALL CATEGORIES (with BIG PAGE SYSTEM)
      const categories = getCategories();
      const categoryNames = Object.keys(categories).sort();

      const itemsPerPage = 10;
      const totalPages = Math.ceil(categoryNames.length / itemsPerPage);
      let currentPage = parseInt(args[0]) || 1;
      if (currentPage < 1) currentPage = 1;
      if (currentPage > totalPages) currentPage = totalPages;

      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const selectedCategories = categoryNames.slice(startIdx, endIdx);

      let helpMessage = "━━━━━━━━━━━━━━\n";
      helpMessage += `📋 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 (Page ${currentPage}/${totalPages}):\n\n`;

      const emojis = {
        admin: "🛡️",
        ai: "🤖",
        "ai image": "🖼️",
        "ai image edit": "🎨",
        anime: "😺",
        "box chat": "🗃️",
        chat: "💬",
        config: "⚙️",
        "contacts admin": "📞",
        custom: "✨",
        developer: "👨‍💻",
        economy: "💰",
        fun: "😜",
        game: "🎮",
        "group chat": "👥",
        image: "🖼️",
        info: "ℹ️",
        love: "❤️",
        media: "🎞️",
        music: "🎵",
        owner: "👑",
        rank: "🏆",
        software: "💻",
        system: "⚙️",
        tools: "🛠️",
        utility: "🧰",
        wiki: "📚",
        help: "❓"
      };

      let categoryIndex = startIdx;
      selectedCategories.forEach(cat => {
        categoryIndex++;
        const emoji = emojis[cat.toLowerCase()] || "📂";
        const cmds = categories[cat].map(c => `│ ⌯ ${c.name}`).join("\n");
        helpMessage += `╭─╼━━━━━━━━╾─╮\n`;
        helpMessage += `│ ${categoryIndex}. ${emoji} | ${cat}\n`;
        helpMessage += `${cmds}\n`;
        helpMessage += `╰─━━━━━━━━━╾─╯\n`;
      });

      helpMessage += "━━━━━━━━━━━━━━\n";
      helpMessage += `🔢 Total Commands: ${files.length}\n`;
      helpMessage += `⚡ Prefix: ${threadPrefix}\n`;
      helpMessage += `👑 Role: All Users\n`;
      helpMessage += `👤 Owner: 𝐋𝐮𝐜𝐢𝐟ē𝐫𝐢𝐚𝐧 𝐙𝐞𝐭𝐬ū 𝐈𝐈\n`;
      helpMessage += `📖 Use: ${threadPrefix}help [page] or ${threadPrefix}help [command]\n`;
      helpMessage += "━━━━━━━━━━━━━━";

      await sendMessage(helpMessage, event.threadID);
    } catch (err) {
      console.error("Error generating help message:", err);
      sendMessage("⚠️ Failed to generate help list.", event.threadID);
    }
  }
};
