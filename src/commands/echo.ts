import command from "../command";

module.exports = {
    command: new command.Command({
        name: "echo",
        description: "Replies with what you said.",
        async callback(msg) {
            const c = msg.content.substr(5)
            return {
                isReply: false,
                message: c.trim() === "" ? "I can't echo nothing." : c
            }
        }
    })
}