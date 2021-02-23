import { Message } from "discord.js";
import { Command } from "../../commandhandler";

exports.command = new Command({
    name: "driprate",
    description: "drippin",
    async callback(msg : Message) {
        let drip = Math.floor(Math.random() * 100)
        return {
            isReply: true,
            message: `you're ${drip}% drippin ` + (drip === 100 ? "<:drippin:811676921111773214>" : drip >= 75 ? ":fire:" : drip >= 50 ? ":sweat_drops:" : "")
        }
    }
})