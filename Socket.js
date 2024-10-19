const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, Browsers } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const { PREFIX } = require('./config');
const config = require('./config');
const { Boom } = require('@hapi/boom');
const { serialize, decodeJid } = require('./lib/message');
const { commands } = require("./lib/commands");
const { connect } = require("./lib/session");
const store = makeInMemoryStore({ logger: P().child({ level: "silent", stream: "store" }) });


async function startBot() {
    const Microsoft = "./session";
    fs.mkdirSync(Microsoft, { recursive: true });
    let sessionId;
    sessionId = await connect();
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, Microsoft), sessionId);
    
    
    
