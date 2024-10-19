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
const {
	message,
	updatePresenceStatus
} = require('./lib');

async function connectBot() {
	const Microsoft = "./session";
    fs.mkdirSync(Microsoft, { recursive: true });
    let sessionId;
    sessionId = await connect();
    
	const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
	const conn = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, pino({
				level: "fatal"
			}).child({
				level: "fatal"
			})),
		},
		browser: ['Ubuntu', 'Chrome', '20.0.04'],
		logger: pino({ level: "silent" }),
		printQRInTerminal: true,
		markOnlineOnConnect: false
	});

	const store = makeInMemoryStore({
		logger: pino().child({
			level: 'silent',
			stream: 'store'
		})
	});
	store.bind(conn.ev);
	conn.ev.on('connection.update', async (update) => {
		const { connection } = update;
		if (connection === "open") {
			fs.readdirSync("./commands").forEach((plugin) => {
				if (path.extname(plugin).toLowerCase() === ".js") {
					import("./commands/" + plugin);
				}
			});
			console.log("_Installed_");
	 		console.log("Connected to WhatsApp");
		} else if (connection === "close") {
			console.log("Connection closed: Reconnecting...");
				await connectBot();
			}, 3000);
		}
	});

	conn.ev.on('messages.upsert', async (m) => {
		await message(conn, m);
	});

	conn.ev.on('creds.update', saveCreds);
}


	await connectBot();
}, 2000);
    
