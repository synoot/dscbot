//
// Entrypoint: runs bot, handles commands, loads data, etc.
//

import djs from "discord.js";
import commands from "./command";
import data from "./data";
import { TypeObject } from "./types";

const base = new data.DataBase()
const dataHelper = new data.DataHelper(base)

const tbase = new data.DataBase() //temporary data storage; wiped upon the bot shutting down
const tdHelper = new data.DataHelper(tbase)

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

function refreshCommands() {
    cHandler.commands = new Map()
    return cHandler.loadFromDirectory()
}

async function onMessage(msg : djs.Message) {
    if (msg.author.bot) return
    if (!msg.guild?.id) return

    const spl = msg.content.split(" ")
    const cmd = cHandler.getCommand(spl[0].substr(prefix.length))

    const guildcat = dataHelper.getCategory(msg.guild.id)

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
        safeEdit(m, `:+1: Finished! Use ${prefix}help to view any new commands.`)
    } else if (spl[0] === `${prefix}help`) {
        const sc /* selected category */ = cHandler.getCategory(spl[1])
        const cats /* categories */ = cHandler.getCategories()
        let hstring /* help string */ = `Default prefix: \`${prefix}\`\nThe prefix for a command is next to it's name, ex: \`${prefix}help\`\n`

        if (sc !== undefined) { //specific category
            if (sc.commands.size > 0) {
                hstring = `${hstring}**${sc.name}**:\n`
                sc.commands.forEach((cmd) => {
                    hstring = `${hstring}\t**${cmd.name}** - **${cmd.description}**\n`
                })
            } else { //DRY, I know, but I'm lazy
                hstring = `${hstring}Categories:\n`
            
                cats.forEach((cat) => {
                    if (cat.commands.size > 0) { hstring = `${hstring}\t**${cat.name}** - total commands: **${cat.commands.size}**\n` }
                })
            }
        } else { //no category
            hstring = `${hstring}Categories:\n`
            
            cats.forEach((cat) => {
                if (cat.commands.size > 0) { hstring = `${hstring}\t**${cat.name}** - total commands: **${cat.commands.size}**\n` }
            })
        }

        safeSend(msg, hstring)
    }

    // XP stuff goes here

    const xpOptions = < TypeObject<any> > dataHelper.getData("xpOptions", {
        enabled: true,
        xpRewards: {},
        xpCharMult: 0.1,
        dailyCharMult: 0.0025,
        levelMult: 1.2,
        msgMult: 2,
        msgBase: 50,
        xpChannel: 0,
    }, guildcat)
    
    if (xpOptions.enabled) {
        const xpInfo = < TypeObject<any> > dataHelper.getData(`${msg.author.id}_xpInfo`, {
            xp: 0,
            xpTo: 200,
            level: 0,
            lastMsg: new Date().getTime(),
            spamLastMsg: new Date().getTime(), 
            msgs: 0,
            maxMsgs: xpOptions.msgBase,
            streak: 0,
            modifier: 1
        }, guildcat)
        const msgChars = clamp(msg.content.length, 0, 500)
        const since = (new Date().getTime() / 1000) - (xpInfo.lastMsg / 1000)
    
        if ((new Date().getTime() / 1000) - (xpInfo.spamLastMsg / 1000) >= 15) {
            xpInfo.xp = xpInfo.xp + ((msgChars * xpOptions.xpCharMult) * xpInfo.modifier)
            xpInfo.msgs++
    
            if (xpInfo.msgs <= xpInfo.maxMsgs) {
                xpInfo.modifier += msgChars * xpOptions.dailyCharMult
            }
    
            if (since >= 86400 && since < 127800) { // 24 hours to 48 hours
                xpInfo.streak = clamp(xpInfo.streak + 1, 0, 31)
                xpInfo.msgs = 0
                xpInfo.lastMsg = new Date().getTime()
    
                xpInfo.maxMsgs = clamp((xpInfo.streak * xpOptions.msgMult) * xpOptions.maxMsgs, xpOptions.maxMsgs, Infinity)
            } else if (since > 127800) { // missed a day (or multiple, but im lazy)
                xpInfo.streak = clamp(xpInfo.streak - 1, 0, 31)
                xpInfo.msgs = 0
                xpInfo.lastMsg = new Date().getTime()
    
                xpInfo.maxMsgs = clamp((xpInfo.streak * xpOptions.msgMult) * xpOptions.maxMsgs, xpOptions.maxMsgs, Infinity)
            }
    
            if (xpInfo.xp >= xpInfo.xpTo) { // level up
                let newRoles : any[] = []
    
                while (xpInfo.xp >= xpInfo.xpTo) { //do a loop to level up. im sure there's a better way, but i'm not a mathematician
                    xpInfo.level++
                    xpInfo.xpTo *= xpOptions.levelMult
    
                    if (xpOptions.xpRewards[String(xpInfo.level)] !== undefined) {
                        await msg.guild?.roles.fetch(xpOptions.xpRewards[String(xpInfo.level)]).then(role => {
                            if (role) { msg.member?.roles.add(role); newRoles.push(role); newRoles.push(xpInfo.level) }
                        }).catch(err => {
                            safeSend(msg, "Unable to give you a level up role. Error:\n```" + err + "```")
                        })
                    }
                }
    
                let endString = ""
    
                if (newRoles.length > 0) {
                    endString = ", and were awarded these roles:\n"
    
                    for (let i = 0; i < newRoles.length; i++) {
                        if (i % 2 === 0) {
                            endString = `${endString}**${newRoles[i].name}** at level **${newRoles[i+1]}**\n`
                        }
                    }
                } else {
                    endString = "!"
                }
    
                
                if (xpOptions.xpChannel !== 0) {
                    const c = client.channels.cache.get(xpOptions.xpChannel) as djs.TextChannel | undefined
    
                    if (c !== undefined) {
                        safeChannelSend(c, `Congratulations, <@${msg.author.id}>! You've leveled up to level **${xpInfo.level}**${endString}`)
                    }
                } else {
                    safeSend(msg, `Congratulations, <@${msg.author.id}>! You've leveled up to level **${xpInfo.level}**${endString}`)
                }
            }
    
            guildcat.addData(`${msg.author.id}_xpInfo`, xpInfo)
        }
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

export default { getPrefix, getDHelper, getTDHelper, getFHelper, getReader, safeSend, safeChannelSend, client }

setInterval(() => {
    base.writeToFile(fileName)
}, 5000)