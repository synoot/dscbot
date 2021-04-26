import { Command } from "../../cmdHandler";

exports.command = new Command({
    name: "echo",
    description: "Repeats what you say",
    callback: async (msg, startingIndex) => {
        const s = msg.content.split(" ").slice(startingIndex + 1)
        const c = s.join(" ").trim()
        return {
            isReply: false,
            message: c.length > 0 ? c : "I can't echo nothing."
        }
    }
})