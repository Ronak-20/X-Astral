const { proto, getContentType, jidDecode, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

function decodeJid(jid) {
    if (!jid) return null;
    if (/:d+@s.whatsapp.net/.test(jid)) {
        const user = jid.split('@')[0];
        return user + '@s.whatsapp.net';
    } else if (jid.includes('@g.us') || jid.includes('@broadcast')) {
        return jid;
    } else {
        return jid;
    }
}

function serialize(msg) {
    if (msg.quoted) {
        try {
            const quoted = msg.message.extendedTextMessage.contextInfo;
            if (quoted.quotedMessage["ephemeralMessage"]) {
                if (quoted.quotedMessage.ephemeralMessage.message["viewOnceMessage"]) {
                    msg.quoted = {
                        type: "view_once",
                        stanzaId: quoted.stanzaId,
                        sender: quoted.participant,
                        message: quoted.quotedMessage.ephemeralMessage.message.viewOnceMessage.message
                    };
                } else {
                    msg.quoted = {
                        type: "normal",
                        stanzaId: quoted.stanzaId,
                        sender: quoted.participant,
                        message: quoted.quotedMessage.ephemeralMessage.message
                    };
                }
            } else if (quoted.quotedMessage["viewOnceMessage"]) {
                msg.quoted = {
                    type: "view_once",
                    stanzaId: quoted.stanzaId,
                    sender: quoted.participant,
                    message: quoted.quotedMessage.viewOnceMessage.message
                };
            } else {
                msg.quoted = {
                    type: "normal",
                    stanzaId: quoted.stanzaId,
                    sender: quoted.participant,
                    message: quoted.quotedMessage
                };
            }
            msg.quoted.isSelf = msg.quoted.sender === sock.user.id;
            msg.quoted.mtype = getContentType(msg.quoted.message);
            msg.quoted.text = msg.quoted.message[msg.quoted.mtype]?.text || msg.quoted.message[msg.quoted.mtype]?.description || msg.quoted.message[msg.quoted.mtype]?.caption || (msg.quoted.mtype === "templateButtonReplyMessage" && msg.quoted.message[msg.quoted.mtype].hydratedTemplate?.hydratedContentText) || msg.quoted.message[msg.quoted.mtype] || "";
            msg.quoted.key = {
                id: msg.quoted.stanzaId,
                fromMe: msg.quoted.isSelf,
                remoteJid: msg.userId
            };
            msg.quoted.download = (pathFile) => downloadMedia(msg.quoted.message, pathFile);
        } catch {
            msg.quoted = null;
        }
    }

    try {
        msg.text = msg.message.conversation || msg.message[msg.type].text || msg.message[msg.type].selectedId;
        msg.body = msg.message.conversation || msg.message[msg.type].text || msg.message[msg.type].caption ||
            (msg.type === "listResponseMessage" && msg.message[msg.type].singleSelectReply.selectedRowId) ||
            (msg.type === "buttonsResponseMessage" && msg.message[msg.type].selectedButtonId) ||
            (msg.type === "templateButtonReplyMessage" && msg.message[msg.type].selectedId) || false;
    } catch {
        msg.body = false;
    }
    msg.sudo = MODES.split(",").includes(msg?.sender?.split("@")[0]) || MODES.split(",").includes(msg?.quoted?.sender?.split("@")[0]) || msg?.isSelf;
}

async function downloadMedia(message, pathFile) {
    const mtype = getContentType(message);
    const stream = await downloadContentFromMessage(message, mtype);  
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    if (pathFile) {
        fs.writeFileSync(pathFile, buffer);
    }
    return buffer;
}

async function downloadAndSaveMedia(message, filename) {
    const mtype = getContentType(message);
    const stream = await downloadContentFromMessage(message, mtype);  // Using downloadContentFromMessage here
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

module.exports = {
    decodeJid,
    serialize
};
                
