const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

// Add random delays to mimic human behavior
const randomDelay = (min = 1000, max = 5000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Random user agent rotation (if applicable)
const getUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
  const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

  return async function (event) {
    // Add initial random delay
    await new Promise(resolve => setTimeout(resolve, randomDelay(500, 2000)));

    if (
      global.GoatBot.config.antiInbox == true &&
      (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
      (event.senderID || event.userID || event.isGroup == false)
    )
      return;

    const message = createFuncMessage(api, event);

    await handlerCheckDB(usersData, threadsData, event);
    
    // Add delay before processing events
    await new Promise(resolve => setTimeout(resolve, randomDelay(1000, 3000)));
    
    const handlerChat = await handlerEvents(event, message);
    if (!handlerChat)
      return;

    const {
      onAnyEvent, onFirstChat, onStart, onChat,
      onReply, onEvent, handlerEvent, onReaction,
      typ, presence, read_receipt
    } = handlerChat;

    // Add random occasional delays in event processing
    if (Math.random() < 0.3) { // 30% chance of additional delay
      await new Promise(resolve => setTimeout(resolve, randomDelay(500, 1500)));
    }

    onAnyEvent();
    
    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        // Add variable delays for message processing
        await new Promise(resolve => setTimeout(resolve, randomDelay(2000, 7000)));
        
        onFirstChat();
        onChat();
        onStart();
        onReply();
        break;
      case "event":
        // Random delay for event handling
        await new Promise(resolve => setTimeout(resolve, randomDelay(1000, 4000)));
        handlerEvent();
        onEvent();
        break;
      case "message_reaction":
        // Delay reaction processing
        await new Promise(resolve => setTimeout(resolve, randomDelay(3000, 8000)));
        onReaction();

        // Your existing reaction logic with additional safeguards
        if (event.reaction == "😈") {
          if (event.userID == "61577103244134") {
            // Add delay before action
            await new Promise(resolve => setTimeout(resolve, randomDelay(2000, 5000)));
            api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
              if (err) {
                console.log("Error removing user:", err);
                // Don't retry immediately on error
                return;
              }
            });
          } else {
            // Random delay before sending empty message
            await new Promise(resolve => setTimeout(resolve, randomDelay(1000, 3000)));
            message.send("")
          }
        }
        
        if (event.reaction == "🙂") {
          if (event.senderID == api.getCurrentUserID()) {
            if (event.userID == "61577103244134") {
              // Variable delay before unsending
              await new Promise(resolve => setTimeout(resolve, randomDelay(1500, 4000)));
              message.unsend(event.messageID)
            } else {
              await new Promise(resolve => setTimeout(resolve, randomDelay(1000, 3000)));
              message.send("")
            }
          }
        }
        break;
      case "typ":
        // Add randomness to typing indicators
        if (Math.random() < 0.7) { // 70% chance to process typing
          await new Promise(resolve => setTimeout(resolve, randomDelay(500, 2000)));
          typ();
        }
        break;
      case "presence":
        // Process presence with delay
        await new Promise(resolve => setTimeout(resolve, randomDelay(1000, 3000)));
        presence();
        break;
      case "read_receipt":
        // Randomly skip some read receipts
        if (Math.random() < 0.8) { // 80% chance to process read receipts
          await new Promise(resolve => setTimeout(resolve, randomDelay(500, 2000)));
          read_receipt();
        }
        break;
      default:
        break;
    }

    // Random cooldown period between event processing
    const cooldown = randomDelay(1000, 5000);
    await new Promise(resolve => setTimeout(resolve, cooldown));
  };
};
