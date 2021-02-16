import { Message } from "discord.js";
import { Command } from "../commandhandler";

exports.command = new Command({
    name: "upify",
    description: "My money up... Your money up... the cycle never ends!",
    category: "Upification",
    callback(msg : Message) {
        const up = Math.floor(Math.random() * 100)
        return {
            isReply: true,
            message: up >= 50 ? `Your money is ${up}% up. Your money pretty up ngl` : up <= 25 ? `Your money is ${up}% up. Your money lookin a little down...` : `Your money is ${up}% up.`
        }
    }
})