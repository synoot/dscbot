import command from "../command";

module.exports = {
    command: new command.Command({
        name: "hello",
        description: "Hiii~",
        async callback(msg) {
            return {
                isReply: true,
                message: "hello to you too!"
            }
        }
    })
}