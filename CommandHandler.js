class CommandHandler {
    constructor(data = {}) {
        if (!data.folder) throw new Error("[HANDLER] Klasör belirtilmemiş.");
        this.folder = data.folder;
        if(!data.prefix) throw new Error("[HANDLER] Prefix belirtilmemiş.");
        if (!Array.isArray(data.prefix)) data.prefix = [data.prefix];
        data.prefix.sort((a, b) => a.length < b.length);
        this.prefix = data.prefix;
        this._loadFrom(data.folder)
    }

    _loadFrom(folder) {
        const commands = new Map();
        const aliases = new Map();

        const fs = require("fs");

        const files = fs.readdirSync(folder);
        files.filter(f => fs.statSync(folder + f).isDirectory())
            .forEach(nested => fs.readdirSync(folder + nested).forEach(f => files.push(nested + '/' + f)));
        const jsFiles = files.filter(f => f.endsWith('.js'));

        if (files.length <= 0) throw new Error('[HANDLER] Yüklenecek komut yok!');
        const fileAmount = `${jsFiles.length}`;
        console.log(`[HANDLER] ${fileAmount} tane dosya bulundu, yükleniyor\n`);

        for (const f of jsFiles) {
            const file = require(folder + f);
            const cmd = new file();

            const name = cmd.name;
            commands.set(name, cmd);

            console.log(`[HANDLER] Komut yükleniyor: '${name}'`);
            for (const alias of cmd.alias) {
                aliases.set(alias, name);
            }
        }

        console.log('[HANDLER] Bütün komutlar yüklendi');
        this.commands = commands;
        this.aliases = aliases;
    }

    getCommand(string) {

        if (!string) return null;

        let prefix = '';

        let prefixExists = false;

        for (const x of this.prefix) {
            if (string.startsWith(x)) {
                prefix = x;
                prefixExists = true;
                break;
            }
        }

        if (!prefixExists) return null;

        const command = string.substring(prefix.length);
        let cmd = this.commands.get(command);
        if (!cmd) {
            const alias = this.aliases.get(command);
            if (!alias) return null;
            cmd = this.commands.get(alias);
        }
        return cmd;
    }
}
module.exports = {
    CommandHandler
};
