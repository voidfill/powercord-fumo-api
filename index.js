const { Plugin } = require("powercord/entities");
const { getModule } = require("powercord/webpack");
const { get } = require("powercord/http");
const { sendBotMessage } = getModule(["sendBotMessage"], false);
const { getChannelId } = getModule(['getChannelId', 'getLastSelectedChannelId'], false);

let rawFumos = [];
let fumoObj = {};
let fumoIdSet = new Set();

module.exports = class fumoApi extends Plugin {
    async startPlugin() {
        powercord.api.commands.registerCommand({ command: "fumo", executor: this.getFumo.bind(this) });
        rawFumos = (await get("http://fumoapi.herokuapp.com/fumos")).body;
        rawFumos.forEach(fumo => {
            fumoObj[fumo._id] = {_id: fumo._id, URL: fumo.URL};
        });
        fumoIdSet = new Set(Object.keys(fumoObj));
    }

    async getFumo(args) {
        const send = args.includes("--send") ? true : false;
        const id = args.includes("--id") ? true : false;
        let fumo = rawFumos[Math.floor(Math.random() * rawFumos.length + 1)];
        args.forEach(arg => {
            if (arg !== "--id" && arg !== "--send") {
                if(fumoIdSet.has(arg)) { fumo = fumoObj[arg]; }
                console.log(fumo);
            }});
        const text = `${id ? "Id: " + fumo._id + " Url: " : ""}${fumo.URL}`;
        
        if (send) {
            return {send: true, result: text};
        } else {
            let h, w = 0;
            const img = new Image();
            img.src = fumo.URL;
            img.onload = function () { h = this.height; w = this.width; };

            while(h === 0 || w === 0) {
                await new Promise(res => setTimeout(res, 50));
            }
            const embeds = [{
                type: "rich",
                title: "Fumo",
                description: `${text}`,
                color: 3092790,
                image: {
                    url: fumo.URL,
                    proxy_url: fumo.URL,
                    height: h,
                    width: w
                }
            }];
            return sendBotMessage(getChannelId(), "", embeds);
        }
    }
    pluginWillUnload() {
        powercord.api.commands.unregisterCommand("fumo");
        rawFumos = [];
    }
}