 const {
	default: makeWASocket,
	useMultiFileAuthState,
	makeInMemoryStore,
	makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { connect } = require("./lib/session");
const pino = require('pino');

async function connectBot() {
    const Microsoft = "./session";
    fs.mkdirSync(Microsoft, { recursive: true });
    let sessionId;
    sessionId = await connect();
async function startWhatsAppBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info'); 

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,  
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.log(chalk.red('Logged out from WhatsApp. Please scan QR again.'));
            } else {
                console.log(chalk.yellow('Reconnecting...'));
                await startWhatsAppBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('Connected to WhatsApp successfully!'));
        }
    });

    sock.ev.on('messages.upsert', async (messageUpdate) => {
        require('./handler/messageHandler')(sock, messageUpdate);  
    });

    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;  

        const groupMetadata = await sock.groupMetadata(id); 
        const groupName = groupMetadata.subject;
        const currentTime = moment().format('HH:mm'); 

        for (let participant of participants) {
            const contact = await sock.fetchStatus(participant); 

            if (action === 'add') {
                
                const welcomeMessage = `Welcome {X}! You have joined {G} at {T}`.replace('{X}', contact.status || participant).replace('{G}', groupName).replace('{T}', currentTime);
                await sock.sendMessage(id, { text: welcomeMessage });
            } else if (action === 'remove') {
                
                const goodbyeMessage = `Goodbye {X}! You have left {G} at {T}`.replace('{X}', contact.status || participant).replace('{G}', groupName).replace('{T}', currentTime);
                await sock.sendMessage(id, { text: goodbyeMessage });
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startWhatsAppBot().catch((err) => {
  });

	
