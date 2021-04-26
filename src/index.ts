import { Bot } from "./bot"
import djs from "discord.js"
import { JSONReader } from "./data"
import { BasicObject } from "./types"

let botObject : Bot;

async function onRead(data : BasicObject<any> | string | void) {
    if (typeof data === "string") { throw data }

    if (typeof data === "object") {
        // Note: You must call bot.commandHolder.load() before you can use commands!
        botObject = new Bot({
            prefix: data[`prefix_${mode}`],
            token: data[`token_${mode}`]
        })

        await botObject.commandHolder.load()

        botObject.client.on("ready", () => {
            console.log(`Bot (${botObject.client.user?.username}) is ready.`)

            botObject.client.user?.setPresence({
                activity: {
                    type: "WATCHING",
                    name: `${botObject.client.guilds.cache.size} guilds | ${botObject.prefix} or @ me | major version 3`
                }
            })
        })

        botObject.client.on("message", (msg : djs.Message) => {
            if (msg.author.bot) return

            const splMessage = msg.content.split(" ")

            // i dont understand why pings are either <@X> or <@!X>
            const mentionsBot = splMessage[0].trim() === `<@${botObject.client.user?.id}>` || splMessage[0].trim() === `<@!${botObject.client.user?.id}>`
            let startingIndex = 0; // the index the message technically begins at, used for single word prefixes

            // I could do this in a smarter way. I don't want to
            if (mentionsBot || (splMessage[0] === botObject.prefix && botObject.prefix.substr(botObject.prefix.length - 1) === " ")) { startingIndex = 1 }
            if (msg.content.substr(0, botObject.prefix.length) === botObject.prefix || mentionsBot) {
                let cmdName = splMessage[0].substr(1)
                if (startingIndex > 0) { cmdName = splMessage[startingIndex] }
                
                const cmd = botObject.commandHolder.commandMap.get(cmdName)

                if (cmd !== undefined) {
                    cmd.callback(msg, startingIndex).then((val) => {
                        let reply = val.message

                        if (val.isReply) { reply = `<@${msg.author.id}>, ${reply}` }
                        
                        msg.channel.send(val.message, { embed: val.embed }).catch((reason) => console.error(reason))
                    })
                }
            }
        })

        botObject.login()
    }
}

const reader = new JSONReader()
let mode = process.argv[2]

if (!mode || (mode !== "production" && mode !== "prod" && mode !== "dev")) { 
    console.error(`'mode' was not supplied, or is invalid. It is the first argument.\nPossible values: 'production' 'prod' 'dev'\nSupplied: '${mode}'\nFalling back to production.`)
    mode = "prod"
}

if (mode === "production") { mode = "prod" } // mode realistically has to be 'prod' or 'dev'

reader.readFromPath("./save/config.json").then((dat) => onRead(dat))

// getters

function getBot() { return botObject }

export default { getBot }