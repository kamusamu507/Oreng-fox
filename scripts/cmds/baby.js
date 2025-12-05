const axios = require("axios");

const mahmud = [
  "baby",
  "bby",
  "babu",
  "bbu",
  "jan",
  "bot",
  "জান",
  "জানু",
  "বেবি",
  "wifey",
  "hinata",
];

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports.config = {
   name: "hinata",
   aliases: ["baby", "bby", "bbu", "jan", "janu", "wifey", "bot"],
   version: "1.7",
   author: "MahMUD",
   role: 0,
   category: "chat",
   guide: {
     en: "{pn} [message] OR teach [question] - [response1, response2,...] OR remove [question] - [index] OR list OR list all OR edit [question] - [newResponse] OR msg [question]\nNote: The most updated and fastest all-in-one Simi Chat."
   }
 };

module.exports.onStart = async ({ api, event, args, usersData }) => {
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);  if (module.exports.config.author !== obfuscatedAuthor) {  return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID); }
      const msg = args.join(" ").toLowerCase();
      const uid = event.senderID;

  try {
    if (!args[0]) {
      const ran = ["Bolo baby", "I love you", "type !bby hi"];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

 
    if (args[0] === "teach") {
      const mahmud = msg.replace("teach ", "");
      const [trigger, ...responsesArr] = mahmud.split(" - ");
      const responses = responsesArr.join(" - ");
      if (!trigger || !responses) return api.sendMessage("❌ | teach [question] - [response1, response2,...]", event.threadID, event.messageID);
      const response = await axios.post(`${await baseApiUrl()}/api/jan/teach`, { trigger, responses, userID: uid,  });
      const userName = (await usersData.getName(uid)) || "Unknown User";
      return api.sendMessage( `✅ Replies added: "${responses}" to "${trigger}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, event.threadID, event.messageID  );
   }

    
    if (args[0] === "remove") {
      const mahmud = msg.replace("remove ", "");
      const [trigger, index] = mahmud.split(" - ");
      if (!trigger || !index || isNaN(index)) return api.sendMessage("❌ | remove [question] - [index]", event.threadID, event.messageID);
      const response = await axios.delete(`${await baseApiUrl()}/api/jan/remove`, {
      data: { trigger, index: parseInt(index, 10) }, });
      return api.sendMessage(response.data.message, event.threadID, event.messageID);
   }

    
    if (args[0] === "list") {
      const endpoint = args[1] === "all" ? "/list/all" : "/list";
      const response = await axios.get(`${await baseApiUrl()}/api/jan${endpoint}`);
      if (args[1] === "all") {  let message = "👑 List of Hinata teachers:\n\n";
      const data = Object.entries(response.data.data) .sort((a, b) => b[1] - a[1])  .slice(0, 15); for (let i = 0; i < data.length; i++) {
      const [userID, count] = data[i];
      const name = (await usersData.getName(userID)) || "Unknown"; message += `${i + 1}. ${name}: ${count}\n`; } return api.sendMessage(message, event.threadID, event.messageID); }
      return api.sendMessage(response.data.message, event.threadID, event.messageID);
   }

    
    if (args[0] === "edit") {
      const mahmud = msg.replace("edit ", "");
      const [oldTrigger, ...newArr] = mahmud.split(" - ");
      const newResponse = newArr.join(" - ");  if (!oldTrigger || !newResponse)
      return api.sendMessage("❌ | Format: edit [question] - [newResponse]", event.threadID, event.messageID);
      await axios.put(`${await baseApiUrl()}/api/jan/edit`, { oldTrigger, newResponse });
      return api.sendMessage(`✅ Edited "${oldTrigger}" to "${newResponse}"`, event.threadID, event.messageID);
   }

    
    if (args[0] === "msg") {
      const searchTrigger = args.slice(1).join(" ");
      if (!searchTrigger) return api.sendMessage("Please provide a message to search.", event.threadID, event.messageID); try {
      const response = await axios.get(`${await baseApiUrl()}/api/jan/msg`, {  params: { userMessage: `msg ${searchTrigger}` }, });
      return api.sendMessage(response.data.message || "No message found.", event.threadID, event.messageID);  } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "error";
      return api.sendMessage(errorMessage, event.threadID, event.messageID);   }
   }

    
    const getBotResponse = async (text, attachments) => { try { 
      const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text, style: 3, attachments }); return res.data.message; } catch { return "error janu🥹"; } };
      const botResponse = await getBotResponse(msg, event.attachments || []);
      api.sendMessage(botResponse, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "hinata",
          type: "reply",
          messageID: info.messageID,
          author: uid,
          text: botResponse
        });
      }
    }, event.messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage(`${err.response?.data || err.message}`, event.threadID, event.messageID);
  }
};


module.exports.onReply = async ({ api, event }) => {
   if (event.type !== "message_reply") return; try { const getBotResponse = async (text, attachments) => {  try {
    const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text, style: 3, attachments }); return res.data.message; } catch {  return "error janu🥹"; } };
    const replyMessage = await getBotResponse(event.body?.toLowerCase() || "meow", event.attachments || []);
    api.sendMessage(replyMessage, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "hinata",
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: replyMessage
        });
      }
    }, event.messageID);
  } catch (err) {
    console.error(err);
  }
};


module.exports.onChat = async ({ api, event }) => {
  try {
    const message = event.body?.toLowerCase() || "";
    const attachments = event.attachments || [];

    if (event.type !== "message_reply" && mahmud.some(word => message.startsWith(word))) {
      api.setMessageReaction("🪽", event.messageID, () => {}, true); api.sendTypingIndicator(event.threadID, true);   const messageParts = message.trim().split(/\s+/);
      const getBotResponse = async (text, attachments) => {
      try {
      const res = await axios.post(`${await baseApiUrl()}/api/hinata`, { text, style: 3, attachments });  return res.data.message; } catch {  return "error janu🥹";
        }
      };

       const randomMessage = [
          "babu khuda lagse🥺",
          "Hop beda😾,Boss বল boss😼",  
          "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",  
          "🐒🐒🐒",
          "bye",
          "naw amr boss k message daw https://m.me/f3ckuU",
          "mb nei bye",
          "meww",
          "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
          "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",  
          "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
          "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏",
          "গোসল করে আসো যাও😑😩",
          "অ্যাসলামওয়ালিকুম",
          "কেমন আসো",
          "বলেন sir__😌",
          "বলেন ম্যাডাম__😌",
          "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
          "🙂🙂🙂",
          "এটায় দেখার বাকি সিলো_🙂🙂🙂",
          "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼 😒😒",
          "𝗧𝗮𝗿𝗽𝗼𝗿 𝗯𝗼𝗹𝗼_🙂",
          "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁𝗼__🥺",
          "𝗕𝗯𝘆 না জানু, বল 😌",
          "বেশি bby Bbby করলে leave নিবো কিন্তু 😒😒",
          "__বেশি বেবি বললে কামুর দিমু 🤭🤭",
          "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂",
          "bolo baby😒",
          "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
          "আমি তো অন্ধ কিছু দেখি না🐸 😎",
          "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🫣",
          "𝗼𝗶𝗶 ঘুমানোর আগে.! তোমার মনটা কথায় রেখে ঘুমাও.!🤔_নাহ মানে চুরি করতাম 😞😘",
          "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘",
          "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗯𝗯𝘆 𝗯𝗯𝘆 করিস  😉😋🤣",
          "এই এই তোর পরীক্ষা কবে? শুধু 𝗕𝗯𝘆 𝗯𝗯𝘆 করিস 😾",
          "তোরা যে হারে 𝗕𝗯𝘆 ডাকছিস আমি তো সত্যি বাচ্চা হয়ে যাবো_☹😑",
          "আজব তো__😒",
          "আমাকে ডেকো না,আমি ব্যাস্ত আসি🙆🏻‍♀",
          "𝗕𝗯𝘆 বললে চাকরি থাকবে না",
          "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, MahMUD ,MahMUD ও তো করতে পারো😑?",
          "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈",
          "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
          "হটাৎ আমাকে মনে পড়লো 🙄",
          "𝗕𝗯𝘆 বলে অসম্মান করচ্ছিছ,😰😿",
          "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
          "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
          "খাওয়া দাওয়া করসো 🙄",
          "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
          "আরে আমি মজা করার mood এ নাই😒",
          "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
          "আরে Bolo আমার জান, কেমন আসো? 😚",
          "একটা BF খুঁজে দাও 😿",
          "ফ্রেন্ড রিকোয়েস্ট দিলে ৫ টাকা দিবো 😗",
          "oi mama ar dakis na pilis 😿",
          "🐤🐤",
          "__ভালো হয়ে  যাও 😑😒",
          "এমবি কিনে দাও না_🥺🥺",
          "ওই মামা_আর ডাকিস না প্লিজ",
          "৩২ তারিখ আমার বিয়ে 🐤",
          "হা বলো😒,কি করতে পারি😐😑?",
          "বলো ফুলটুশি_😘",
          "amr JaNu lagbe,Tumi ki single aso?",
          "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺",
          "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄",
          "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄",
          "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫",
          "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
          "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
          "ভুলে জাও আমাকে 😞😞",
          "দেখা হলে কাঠগোলাপ দিও..🤗",
          "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নি🥺 পচা তুমি🥺",
          "আগে একটা গান বলো, ☹ নাহলে কথা বলবো না 🥺",
          "বলো কি করতে পারি তোমার জন্য 😚",
          "কথা দেও আমাকে পটাবা...!! 😌",
          "বার বার Disturb করেছিস কোনো 😾, আমার জানু এর সাথে ব্যাস্ত আসি 😋",
          "আমাকে না দেকে একটু পড়তে বসতেও তো পারো 🥺🥺",
          "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑😒",
          "ওই তুমি single না?🫵🤨 😑😒",
          "বলো জানু 😒",
          "Meow🐤",     
          "আর কত বার ডাকবা ,শুনছি তো 🤷🏻‍♀",
          "কি হলো, মিস টিস করচ্ছো নাকি 🤣",
          "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈",
          "আজকে আমার mন ভালো নেই 🙉",
          "আমি হাজারো মশার Crush😓",
          "প্রেম করার বয়সে লেখাপড়া করতেছি, রেজাল্ট তো খা/রা'প হবেই.!🙂",
          "আমার ইয়ারফোন চু'রি হয়ে গিয়েছে!! কিন্তু চোর'কে গা-লি দিলে আমার বন্ধু রেগে যায়!'🙂",
          "ছেলেদের প্রতি আমার এক আকাশ পরিমান শরম🥹🫣",
          "__ফ্রী ফে'সবুক চালাই কা'রন ছেলেদের মুখ দেখা হারাম 😌",
          "মন সুন্দর বানাও মুখের জন্য তো 'Snapchat' আছেই! 🌚" 
        ];
                                                                                                                    
        const hinataMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
        if (messageParts.length === 1 && attachments.length === 0) {
        api.sendMessage(hinataMessage, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "hinata",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: hinataMessage
            });
          }
        }, event.messageID);
      } else { let userText = message; for (const prefix of mahmud) {
          if (message.startsWith(prefix)) { userText = message.substring(prefix.length).trim();
          break;
          }
        }

        const botResponse = await getBotResponse(userText, attachments);
        api.sendMessage(botResponse, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "hinata",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: botResponse
            });
          }
        }, event.messageID);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
