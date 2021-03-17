//
// Entrypoint: runs bot, handles commands, loads data, etc.
//

import djs from "discord.js";
import commands from "./command";
import data from "./data";
import mods from "./modules"
import { TypeCommand, TypeObject } from "./types";

const base = new data.DataBase()
const dataHelper = new data.DataHelper(base)

const tbase = new data.DataBase() //temporary data storage; wiped upon the bot shutting down
const tdHelper = new data.DataHelper(tbase)

const fileHelper = new data.FileHelper()

const dirReader = new data.DirectoryReader()
const cHandler = new commands.CommandHandler()

const mbase = new mods.ModuleBase()
let m_cmdList : Map<string, TypeCommand>

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

// getter

function getPrefix() { return prefix }
function getDHelper() { return dataHelper }
function getTDHelper() { return tdHelper }
function getFHelper() { return fileHelper }
function getReader() { return dirReader }

// functions/handlers/callbacks/whatever

function safeSend(msg : djs.Message, content : any) {
    return msg.channel.send(content).catch((err) => console.warn(err)) as Promise<djs.Message>
}

function safeChannelSend(channel : djs.TextChannel, content : any) {
    return channel.send(content).catch((err) => console.warn(err)) as Promise<djs.Message>
}

function safeEdit(msg : djs.Message, content : any) {
    return msg.edit(content).catch((err) => console.warn(err)) as Promise<djs.Message>
}

async function refreshCommands() {
    cHandler.commands = new Map()
    cHandler.loadFromDirectory()

    await mbase.loadModules();
    m_cmdList = mbase.getCommandList();
}

async function onMessage(msg : djs.Message) {
    if (msg.author.bot) return
    if (!msg.guild?.id) return

    const spl = msg.content.split(" ")
    let cmdn = spl[0].substr(prefix.length)

    console.log(cmdn, m_cmdList.get(cmdn))

    let cmd = m_cmdList.get(cmdn)

    cmd = cmd !== undefined ? cmd : cHandler.getCommand(cmdn)

    mbase.callMain(msg, client)

    if (cmd !== undefined) {
        if (cmd.prefix === msg.content.substr(0, prefix.length)){ /* this command matches, check the prefix */
            const res = await cmd.callback(msg)

            if (res.embed !== undefined) {
                safeSend(msg, {embed: res.embed})
            } else {
                res.message = res.isReply === true ? `${msg.author}, ${res.message}` : res.message
    
                if (res.users) {
                    for (let i = 0; i < res.users.length; i++) {
                        res.message = res.message.replace(";", `<@${res.users[i]}>`)
                    }
                }

                safeSend(msg, res.message)
            }
        }
    } else if (spl[0] === `${prefix}reload` && msg.author.id === "152906725350047746") {
        const m = await safeSend(msg, ":repeat: Reloading.. may take some time.")
        await refreshCommands()
        safeEdit(m, `:+1: Finished! Use ${prefix}help to view any new commands/modules.`)
    } else if (spl[0] === `${prefix}help`) {
        const sc /* selected category */ = cHandler.getCategory(spl[1])
        const sm /* selected module */ = mbase.getModule(spl[1])
        const cats /* categories */ = cHandler.getCategories()
        let hstring /* help string */ = `Default prefix: \`${prefix}\`\nThe prefix for a command is next to it's name, ex: \`${prefix}help\`\n\n`

        if (sm) { //specific category
            hstring = `${hstring}**${sm.name} (${sm.enabled === true ? "Enabled" : "Disabled"})**:\n`
            if (sm.commands.size > 0) {
                sm.commands.forEach((cmd) => { hstring = `${hstring}\t**${cmd.prefix}${cmd.name}** - **${cmd.description}**`})
            } else {
                hstring = `${hstring}**\tNo loaded commands.`
            }
        } else if (sc) {
            if (sc.commands.size > 0) {
                hstring = `${hstring}**${sc.name}**:\n`
                sc.commands.forEach((cmd) => { hstring = `${hstring}\t**${cmd.prefix}${cmd.name}** - **${cmd.description}**\n` })
            } else {
                hstring = `${hstring}**${sc.name}**:\n\tNo loaded commands.`
            }
        } else { //no category
            if (mbase.modules.size > 0) {
                hstring = `${hstring}Modules:\n`
    
                mbase.modules.forEach((m, n) => {
                    hstring = `${hstring}\t**${n} (${m.enabled === true ? "Enabled" : "Disabled"})**\n\t\t**${m.description}**\n\t\t\tPath: \`${m.debugPath}\`\n\t\t\tTotal commands: \`${m.commands.size}\`\n\n`
                })
            }

            hstring = `${hstring}Categories:\n`
            cats.forEach((cat) => { if (cat.commands.size > 0) { hstring = `${hstring}\t**${cat.name}** - total commands: **${cat.commands.size}**\n` } })
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

async function onLoad(dat : TypeObject<any>) {
    prefix = <string>dat[`prefix_${mode}`]
    token = <string>dat[`token_${mode}`]
    
    await refreshCommands()

    console.log(`module commands: ${m_cmdList.size}`)
    console.log(`${Array.from(m_cmdList.keys())}`)

    client.once("ready", () => onLogin())
    client.on("message", (msg) => onMessage(msg))
    
    client.login(token)
}

// Loaded

fileHelper.readFileJSON('./save/config.json').then((dat) => onLoad(dat)).catch((err) => { throw err })

// Export getters and thing a ma bobbers

export default { getPrefix, getDHelper, getTDHelper, getFHelper, getReader, safeSend, safeChannelSend, client }

setInterval(() => {
    base.writeToFile(fileName)
}, 5000)