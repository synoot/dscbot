import { Message } from "discord.js";
import { Command } from "../commandhandler";

exports.command = new Command({
    name: "ban",
    description: "gone",
    async callback(msg : Message) {
        const mention = msg.mentions.users.first()

        if (mention === undefined) {
            return {
                isReply: true,
                message: "you have to ping someone LOL"
            }
        }

        return {
            isReply: true,
            message: `banned <@${mention.id}> LOL (fr)`
        }
    }
})