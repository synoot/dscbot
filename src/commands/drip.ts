import { Message } from "discord.js";
import { Command } from "../commandhandler";

exports.command = new Command({
    name: "drip",
    description: "drip",
    category: "Amogus",
    async callback(msg : Message) {
        return {
            isReply: false,
            message: `<:drippin:811676921111773214>`
        }
    }
})