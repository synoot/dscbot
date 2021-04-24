import bot from "./bot"
import djs from "discord.js"
import { JSONReader } from "./data"
import { BasicObject } from "./types"

async function onRead(data : BasicObject<any> | string | void) {
    if (typeof data === "string") { throw data }

    if (typeof data === "object") {
        // Note: You must call bot.commandHolder.load() before you can use commands!
        const botObject = new bot.Bot({
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
            // the message starts with the prefix - technically, i could add support for single word prefixes (e.g. foo x or foo y) but im lazy
            if (msg.content.substr(0, botObject.prefix.length) === botObject.prefix) {
                const cmdName = splMessage[0].substr(1)
                const cmd = botObject.commandHolder.commandMap.get(cmdName)

                if (cmd !== undefined) {
                    cmd.callback(msg).then((val) => {
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