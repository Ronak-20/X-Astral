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
        const { connection, lastDisconnect } = update;
      } if (connection === 'close') {
            const status = new Boom(lastDisconnect?.error)?.output?.status;
            if (status === DisconnectReason.loggedOut) {
            console.log(chalk.red('Logged out'));
            } else {
                await WhatsAppBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('Connected to WhatsApp'));
        }
    }); 

    sock.ev.on('messages.upsert', async (messagez) => {
        require('./lib/serialize')(sock, messagez);  
    });

    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;  
        const groupMetadata = await sock.groupMetadata(id); 
        const gc = groupMetadata.subject;
        const current = moment().format('HH:mm'); 
        for (let participant of participants) {
            const contact = await sock.fetchStatus(participant); 
            if (action === 'add') {      
                const msgi = `*Welcome*: {X}\nJoined {G} at {T}`.replace('{X}', contact.status || participant).replace('{G}', gc).replace('{T}', current);
                await sock.sendMessage(id, { text: msgi });
            } else if (action === 'remove') {           
                const gmsg = `*Goodbye*: {X}\nLeft {G} at {T}`.replace('{X}', contact.status || participant).replace('{G}', gc).replace('{T}', current);
                await sock.sendMessage(id, { text: gmsg });
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

  WhatsAppBot().catch((err) => {
  });

	
