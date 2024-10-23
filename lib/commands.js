const { serialize } = require('./serialize');
const chalk = require('chalk');
const { prefix } = require('../config');

let commands = [];
class doVoid {
  static Void({ command, package, desc, execute }) {
    commands.push({ command, package, desc, execute });
  }
}

/*doVoid.Void({
  command: '',
  category: 'general',
  description: '',
  async execute(sock, message, args) {
    await sock.sendMessage(message.chat, { text: `${args.join(' ')}` });
  }
});*/

async function pattern(cmd, sock, message, args) {
  let matched = commands.find(cmd => cmd.command === cmd);
  if (matched) {
    try {
      await matched.execute(sock, message, args);
    } catch (error) {}
  } else {}
}

async function message(sock, msg) {
  if (msg.type !== "notify") return;
  try {
    let m = await serialize(JSON.parse(JSON.stringify(msg.messages[0])), sock);
    const chatId = msg.messages[0].key.remoteJid;
    const user = msg.messages[0].key.participant || msg.messages[0].key.remoteJid;
    const info = m.text || "(No text)";  
    console.log(chalk.cyanBright.bold('💬 Message: ') + chalk.whiteBright(info));
    console.log(chalk.greenBright.bold('👤 Sender: ') + chalk.whiteBright(user));
    if (chatId.includes('-')) {
       console.log(chalk.blueBright.bold('👥 Chat: ') + chalk.whiteBright('WhatsApp Group'));
    } else {
            console.log(chalk.magentaBright.bold('💌 Chat: ') + chalk.whiteBright('Private Chat'));
    } if (info.startsWith(prefix)) {
      const args = info.slice(prefix.length).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();
      await pattern(cmd, sock, m, args);
    }
  } catch (error) {}
}

module.exports = { message, doVoid };
      
