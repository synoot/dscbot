import bot from "./bot"
import djs from "discord.js"
import { JSONReader } from "./data"
import { BasicObject } from "./types"

function onRead(data : BasicObject<any> | string | void) {
    if (typeof data === "string") { throw data }

    if (typeof data === "object") {
        const botObject = new bot.Bot({
            prefix: data[`prefix_${mode}`],
            token: data[`token_${mode}`]
        })

        botObject.client.on("ready", () => {
            console.log(`Bot (${botObject.client.user?.username}) is ready.`)

            botObject.client.user?.setPresence({
                activity: {
                    type: "WATCHING",
                    name: `${botObject.client.guilds.cache.size} guilds | ${botObject.prefix} or @${botObject.client.user.username}`
                }
            })
        })

        botObject.client.on("message", (msg : djs.Message) => {
            console.log(msg.content)

            // placeholder stuff to make sure the bot actually like works

            if (msg.content.toLowerCase() === "james respond") {
                msg.channel.send("Hello!")
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

reader.readFromPath("../discord_bot/save/config.json").then((dat) => onRead(dat))