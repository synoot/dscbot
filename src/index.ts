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

// getter, i should probably improve this

function getPrefix() { return prefix }
function getDHelper() { return dataHelper }
function getTDHelper() { return tdHelper }
function getFHelper() { return fileHelper }
function getReader() { return dirReader }
function getCHandler() { return cHandler }
function getModuleCmdList() { return m_cmdList }
function getModuleBase() { return mbase }

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

    mbase.callMain(msg, client)
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

export default { getPrefix, getDHelper, getTDHelper, getFHelper, getReader, safeSend, safeChannelSend, safeEdit, getCHandler, getModuleCmdList, getModuleBase, refreshCommands, client }

setInterval(() => {
    base.writeToFile(fileName)
}, 5000)