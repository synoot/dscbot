import { Message } from "discord.js";
import { Command } from "../commandhandler";

exports.command = new Command({
    name: "upify",
    description: "My money up... Your money up... the cycle never ends!",
    category: "Upification",
    async callback(msg : Message) {
        let up = (Math.floor(Math.random() * 101) - 1)
        up = up < 0 ? 0 : up
        return {
            isReply: true,
            message: up >= 100 ? `Your money is ${up}% up. Holy crap. Your money... Your money... Your money is SO UP!!` : up >= 50 ? `Your money is ${up}% up. Your money pretty up ngl` : up <= 25 ? `Your money is ${up}% up. Your money lookin a little down...` : `Your money is ${up}% up.`
        }
    }
})