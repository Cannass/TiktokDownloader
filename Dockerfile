# Usa un'immagine di Node.js
FROM node:21-alpine3.18

# Crea una directory di lavoro all'interno del container
WORKDIR /app

COPY .env .
# Copia il package.json e il package-lock.json nella directory di lavoro
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il codice sorgente nella directory di lavoro
COPY src /app/src

# Esponi la porta su cui il bot ascolterà (assicurati di configurare il bot per usare questa porta)
EXPOSE 3000

# Avvia l'applicazione quando il container è in esecuzione
CMD ["node", "src/index.js"]