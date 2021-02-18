import { Message } from "discord.js";
import { Command } from "../commandhandler";

exports.command = new Command({
    name: "echo",
    description: "Echo.",
    async callback(msg : Message) {
        return {
            isReply: false,
            message: msg.content.substr(6)
        }
    }
})