//
// Entrypoint: runs bot, handles commands, loads data, etc.
//

import djs from "discord.js";
import commands from "./command";
import data from "./data";
import { TypeCommand, TypeCommandCategory, TypeObject } from "./types";

const base = new data.DataBase()
const dataHelper = new data.DataHelper(base)
const fileHelper = new data.FileHelper()

const dirReader = new data.DirectoryReader()
const cHandler = new commands.CommandHandler()

const client = new djs.Client({
    disableMentions: "everyone" //dont ping everyone you little dickweed
})

const owoify = require("owoify-js").default;
const clamp = (num : number, min : number, max : number) => Math.min(Math.max(num, min), max)

let mode = process.argv[2]

if (mode === undefined) { mode = "prod"; console.warn("Environment not specified, assuming production.\nUsage: yarn <prod / dev>") }

const fileName = `./save/main${mode === "dev" ? "-dev.json" : ".json"}`

base.loadFromFile(fileName)

let prefix : string = ""
let token : string = ""

// gettr

function getPrefix() { return prefix }
function getDHelper() { return dataHelper }
function getFHelper() { return fileHelper }
function getReader() { return dirReader }

// functions/handlers/callbacks/whatever

function safeSend(msg : djs.Message, content : any) {
    return msg.channel.send(content).catch((err) => console.warn(err)) as Promise<djs.Message>
}

function safeEdit(msg : djs.Message, content : any) {
    return msg.edit(content).catch((err) => console.warn(err)) as Promise<djs.Message>
}

function refreshCommands() {
    cHandler.commands = new Map()
    return cHandler.loadFromDirectory()
}

async function onMessage(msg : djs.Message) {
    if (msg.author.bot) return

    const spl = msg.content.split(" ")
    const cmd = cHandler.getCommand(spl[0].substr(prefix.length))

    if (cmd !== undefined) {
        if (cmd.prefix === msg.content.substr(0, prefix.length)){ /* this command matches */
            const res = await cmd.callback(msg)

            res.message = res.isReply === true ? `${msg.author}, ${res.message}` : res.message

            safeSend(msg, res.message)
        }
    } else if (spl[0] === `${prefix}reload` && msg.author.id === "152906725350047746") {
        const m = await safeSend(msg, ":repeat: Reloading.. may take some time.")
        await refreshCommands()
        safeEdit(m, `:+1: Finished! Use ${prefix}help to view any new commands.`)
    } else if (spl[0] === `${prefix}help`) {
        const sc /* selected category */ = cHandler.getCategory(spl[1])
        const cats /* categories */ = cHandler.getCategories()
        let hstring /* help string */ = `Default prefix: \`${prefix}\`\nThe prefix for a command is next to it's name, ex: \`${prefix}help\`\n`

        if (sc !== undefined) { //specific category
            hstring = `${hstring}**${sc.name}**:\n`

            sc.commands.forEach((cmd) => {
                hstring = `${hstring}\t**${cmd.name}** - **${cmd.description}**\n`
            })
        } else { //no category
            hstring = `${hstring}Categories:\n`
            
            cats.forEach((cat) => {
                hstring = `${hstring}\t**${cat.name}** - total commands: **${cat.commands.size}**\n`
            })
        }

        safeSend(msg, hstring)
    }
}

function onLogin() {
    console.log(`Logged into Discord as ${client.user?.username}`)
    
    client.user?.setPresence( {
        activity: {
            type: "WATCHING",
            name: `people who use ${prefix}help`
        },
        status: "online"
    })
}

function onLoad(dat : TypeObject<any>) {
    prefix = <string>dat[`prefix_${mode}`]
    token = <string>dat[`token_${mode}`]
    
    refreshCommands()

    client.once("ready", () => onLogin())
    client.on("message", (msg) => onMessage(msg))
    
    client.login(token)
}

// Loaded

fileHelper.readFileJSON('./save/config.json').then((dat) => onLoad(dat)).catch((err) => { throw err })

// Export getters and thing a ma bobbers

export default { getPrefix, getDHelper, getFHelper, getReader }