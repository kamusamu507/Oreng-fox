const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
  config: {
    name: 'sing',
    author: 'eren',
    usePrefix: false,
    category: 'Youtube Song Downloader'
  },

  onStart: async ({ event, api, args, message }) => {
    try {
      const query = args.join(' ');
      if (!query) return message.reply('Please provide a song name or YouTube link');

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      let videoUrl = query;
      if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const search = await yts(query);
        if (!search.videos.length) {
          return message.reply('No results found');
        }
        videoUrl = search.videos[0].url;
      }

      const apiUrl = `https://www.dur4nto-yeager.rf.gd/api/song?url=${encodeURIComponent(videoUrl)}`;
      const { data } = await axios.get(apiUrl);

      if (data.status !== 'success' || !data.download_url) {
        return message.reply('Failed to fetch audio');
      }

      const filePath = path.join(__dirname, `${Date.now()}.mp3`);

      const audio = await axios({
        url: data.download_url,
        method: 'GET',
        responseType: 'stream',
        maxRedirects: 5,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'identity',
          'Referer': 'https://www.youtube.com',
          'Connection': 'keep-alive'
        }
      });

      const writer = fs.createWriteStream(filePath);
      audio.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply({
        body: `🎧 ${data.title}`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);

    } catch (e) {
      message.reply(`Error: ${e.message}`);
    }
  }
};
