// Load environment variables from .env file
import { config } from 'dotenv';
config();

// Required imports
import express from 'express';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { request } from 'urllib';
import instagramDl from '@sasmeee/igdl';

import { configHttp } from './utils/index.js';
import { handleImages } from './handleImages/index.js';
import { handleDownload, handleDownload2, handleSendVideo } from './bot/index.js';

// Define the port from environment or fallback to 3000
const port = process.env.PORT || 3000;

// Initialize Express and Telegraf bot
const expressApp = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Register webhook endpoints for Telegraf
expressApp.use(bot.webhookCallback(`/${process.env.BOT_SECRET_PATH}`));
expressApp.use(await bot.createWebhook({ domain: process.env.BOT_URL }));

// Handler for Instagram content (currently unused)
async function handleInstagram(chatId, ctx) {
  const dataList = await instagramDl(ctx.message.text);
  // Process Instagram data here if needed
}

// Listen for text messages
bot.on(message('text'), async (ctx) => {
  // Define URL patterns for TikTok and Instagram
  const tiktokUrl = /^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;
  const instagramRegex = /(?:(?:http|https):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/;

  const chatId = ctx.message.chat.id;
  const text = ctx.message.text;
  const isInstagram = instagramRegex.test(text);
  const isTiktok = tiktokUrl.test(text);

  if (!isInstagram && !isTiktok) return;

  // Unshorten any shortened URL using urllib
  const { res } = await request(text, configHttp);
  let unshortedLink = text;

  if (isTiktok) {
    try {
      const resolvedUrl = text.length > 35 ? res.requestUrls[0] : res.requestUrls[1];
      unshortedLink = tiktokUrl.exec(resolvedUrl)[0];
    } catch (error) {
      // If error in URL resolution, use original
    }
  }

  // Download content based on platform
  let response = null;
  let response2 = null;

  if (isTiktok) {
    response = await handleDownload(chatId, unshortedLink, ctx);
    response2 = await handleDownload2(chatId, unshortedLink, ctx);
  } else {
    response = await instagramDl(unshortedLink);
  }

  if (!response || response === 'error') return;

  // Extract sender name
  const name = ctx.message.from.first_name || ctx.message.from.username;

  // Handle TikTok image gallery
  if (isTiktok) {
    if (response.status === 200 && response.result.is_image === true) {
      await handleImages(chatId, unshortedLink, sender, ctx, name, response);
    } else {
      // Send video content
      await handleSendVideo(chatId, response, name, unshortedLink, ctx);
    }
  } else {
    // Handle Instagram download and send
    await handleSendVideo(chatId, response, name, unshortedLink, ctx, true, response[0].download_link);
  }

  // Try to delete the user's original message
  try {
    await ctx.telegram.deleteMessage(chatId, ctx.message.message_id);
  } catch (error) {
    console.error(error);
  }
});

// Start the express server
expressApp.listen(port, async () => {
  console.log(`Listening on port ${port}!`);
});