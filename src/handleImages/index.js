export async function handleImages(chatId, unshorted_link, sender, ctx, name, response) {
    try {
        let photos = Object.values(response.result.media).map((path, index) => ({
            type: 'photo',
            media: path,
        }));
        console.log("INSERT")
        const opts = {
            caption: `Utente ${name}\n ${unshorted_link}`,
        };
        let newMessageID = null
        console.log("SEND AUDIO")
        await ctx.telegram.sendAudio(chatId, response.result.music.url, { caption: 'audioCaption' })
        if (photos.length > 10) {
            // await suddividiEdElabora(photos, ctx, chatId)
            newMessageID = await ctx.telegram.sendMessage(chatId, `Utente ${name}\n${unshorted_link}\n(più di 10 slideShow, non ancora gestito)`, {
            })
        } else {
            await ctx.telegram.sendMediaGroup(chatId, photos, {
                has_spoiler: true
            })
            newMessageID = await ctx.telegram.sendMessage(chatId, `Utente ${name}\n${unshorted_link}`, opts)
        }
    } catch (error) {
        await ctx.telegram.sendMessage(chatId, `Errore nell'elaborazione`)
    }

}