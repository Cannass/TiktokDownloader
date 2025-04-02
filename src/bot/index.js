// Import TikTok downloaders
import { TiktokDownloader } from "@tobyg74/tiktok-api-dl";
import { TiktokDL } from "@lucas_monroe/tiktok-api-dl";

/**
 * Uses the second TikTok downloader library to fetch video content.
 * @returns TikTok download response or 'error' on failure
 */
export async function handleDownload2(chatId, unshorted_link, ctx) {
    try {
        return await TiktokDL(unshorted_link);
    } catch (error) {
        await ctx.telegram.sendMessage(chatId,
            `An error occurred while downloading the video ${ctx.message.text}. Please try resending it.`,
            { reply_to_message_id: ctx.message.message_id }
        );
        return 'error';
    }
}

/**
 * Uses the primary TikTok downloader (with version v1).
 * @returns TikTok download response or 'error' on failure
 */
export async function handleDownload(chatId, unshorted_link, ctx) {
    try {
        return await TiktokDownloader(unshorted_link, {
            version: "v1" // Options: "v1" | "v2" | "v3"
        });
    } catch (error) {
        await ctx.telegram.sendMessage(chatId,
            `An error occurred while downloading the video ${ctx.message.text}. Please try resending it.`,
            { reply_to_message_id: ctx.message.message_id }
        );
        return 'error';
    }
}

/**
 * Sends a video (TikTok or Instagram) to the user, with fallbacks to document or text if needed.
 * @returns The ID of the new message sent
 */
export async function handleSendVideo(chatId, response, name, unshorted_link, ctx, instagram = false, url) {
    // Caption and spoiler options
    const opts = {
        caption: `Utente ${ctx.message.from.first_name}\nCaption: ${response?.result?.description}\n\n${unshorted_link}`,
        has_spoiler: true,
    };

    try {
        if (instagram) {
            // Send Instagram video directly from provided URL
            const newMessage = await ctx.telegram.sendVideo(chatId, url, opts);
            return newMessage;
        }

        // Handle TikTok: check if it's a list of videos or a single video
        let videoToSend = Array.isArray(response.result.video) && response.result.video.length > 0
            ? response.result.video[0]
            : response.result.video;

        const newMessage = await ctx.telegram.sendVideo(chatId, videoToSend, opts);
        return newMessage;

    } catch (error) {
        // Fallback: send as a document (watermarked)
        try {
            const newMessage = await ctx.telegram.sendDocument(chatId, response.result.video_watermark, opts);
            return newMessage;
        } catch (error2) {
            // Final fallback: send as plain text message
            const newMessage = await ctx.telegram.sendMessage(chatId, `Utente ${name}\n${unshorted_link}`, opts);
            return newMessage;
        }
    }
}