export async function elaboraSottoarray(sottoArray, ctx, chatId) {
  await ctx.telegram.sendMediaGroup(chatId, sottoArray, { has_spoiler: true, })
}


export async function suddividiEdElabora(array, ctx, chatId) {
  const dimensioneSottoarray = 10;
  const lunghezzaArray = array.length;
  async function elaboraConRitardo(inizio) {
    const fine = Math.min(inizio + dimensioneSottoarray, lunghezzaArray);
    const sottoarray = array.slice(inizio, fine);
    await elaboraSottoarray(sottoarray, ctx, chatId);

    if (fine < lunghezzaArray) {
      setTimeout(() => {
        elaboraConRitardo(fine);
      }, 5000); // Ritardo di 5 secondi (5000 millisecondi)
    }
  }

  elaboraConRitardo(0);
}

export const configHttp = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:103.0) Gecko/20100101 Firefox/103.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "TE": "trailers"
  }
}