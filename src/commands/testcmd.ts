import { Command } from "../cmdHandler";

exports.command = new Command({
    name: "echo",
    description: "Repeats what you sayas uoy tahw staepeR",
    callback: async (msg) => {
        const s = msg.content.split(" ")
        s.shift()
        const c = s.join(" ").trim()
        return {
            isReply: false,
            message: c.length > 0 ? c : "I can't echo nothing."
        }
    }
})