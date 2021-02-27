import requireDir from "require-dir";
import djs, { DMChannel, Message, NewsChannel, TextChannel } from "discord.js";
import { Base } from "./datahandler";
import { FileHelper } from "./filehelper";
import { TypeObject } from "./types";
import { Command, CommandCategory, CommandHandler } from "./commandhandler";
import { DataHelper } from "./datahelper";

const owoify = require("owoify-js").default //werid champ

enum owolevel {
    NONE,
    OWO,
    UWU,
    UVU
}

const client = new djs.Client({
    disableMentions: "everyone" //dont ping everyone you little dickweed
})

const base = new Base()
const cbase = new CommandHandler()
const fhelper = new FileHelper()
const dhelper = new DataHelper(base)

const clamp = (num : number, min : number, max : number) => Math.min(Math.max(num, min), max)

// WE DO A BIT OF LOADING

const config : TypeObject<any> = fhelper.readFile("./save/config.json")
const prefix = <string>config.prefix

let mode = process.argv[2]

if (mode === undefined) { mode = "prod" }
if (mode !== "dev" && mode !== "prod") { mode = "prod"; console.warn("Warning: The only avaliable modes are 'prod' and 'dev', assuming production.") }

const token = <string>config[`token_${mode}`]

// couple of getters

export function getPrefix() { return prefix }
export function getHelper() { return dhelper }

// config idk

if (prefix === undefined || token === undefined) { throw `Config is incorrect!\nEither prefix or token_${mode} are undefined, perhaps both! Please fix!` }

base.loadFromFile("./save/main.json")

// command list function

function getCommandList() {
    cbase.wipe()

    let commands : TypeObject<any> = requireDir("./commands", { noCache: true , recurse: true }) // returns { "directory" : { "filename" : require("filename") } }
    let list : TypeObject<Command> = {}

    for (const c in commands) {
        // c being the category

        const l = commands[c]

        if (l.command instanceof Command) { //uncategorized
            const cm : Command = l.command

            cbase.getCategory("uncategorized").addCommand(cm)
            list[`${cm.prefix}${cm.name}`] = cm
        } else { //category
            const ct : CommandCategory = new CommandCategory(c)
            cbase.addCategory(ct)

            for(const cms in commands[c]) { // commands
                const cm : Command = l[cms].command

                ct.addCommand(cm)
                list[`${cm.prefix}${cm.name}`] = cm
            }
        }
    }

    return list
}

//send da messge

function safeSend(channel : TextChannel | DMChannel | NewsChannel, content : any) {
    console.log(content)
    channel.send(content).catch((err) => {
        console.log(`Error:\n${err}\nWill attempt to send.`)
        channel.send(`Error!\n${err}`).catch((err) => {
            console.log(`Could not send error for reason:\n${err}`)
        })
    })
}

// some vars

let cmdList = getCommandList()

const helpReplyList : Array<String> = [
    "I keep a watchful eye.",
    "Watch out, there appears to be one mother fucker in the area... I told it to ignore me!",
    "Your mother and I have each other on speed dial.",
    "when the bot is sus :flushed:",
    "when the pretender is mistrustful :flushed:",
    "when the imposter is lying :flushed:",
    "I have two balls. One is named 'Annoying Orange', and the other is named 'Hey Apple'.",
    "Call me Da Vinci. Please",
    "Don't humiliate me, that would be my fetish!",
    "Haha imagine this but it's owoified LOL",
    "I made the Mona Lisa, and Da Vinci used it as a reference. Fucking scum",
    "One mom done, two moms done, three moms done.. I can't be stopped",
    "Wouldn't it be funny if this bot was based",
    "You know, they call me John Discord",
    "Funny Words Go Here!!!"
]

// some callbacks

function ready() {
    console.log(`Logged into Discord as ${client.user?.username}`)
    
    client.user?.setPresence( {
        activity: {
            type: "WATCHING",
            name: "you (default prefix is -)"
        },
        status: "online"
    } )
}

function onMessage(msg : Message) { 
    const spl = msg.content.split(" ")
    const guildID = msg.guild?.id

    if (msg.author.bot === true) return
    if (guildID === undefined) return

    const guildcat = dhelper.getCategory(guildID)
    const owolvl = dhelper.getDataString("owolevel", "none", guildcat)

    const levellingEnabled = dhelper.getDataBool("isLevelling", true, guildcat)

    // XP levelling

    if (levellingEnabled === true) {
        const XPMultiplier = dhelper.getDataInt("xpCharMult", 0.1, guildcat) //multiplies characters in the message
        const XPLevelFactor = dhelper.getDataInt("xpMult", 1.15, guildcat) //multiplies xp to next level
        const DailyMultiplierFactor = dhelper.getDataInt("msgMult", 2, guildcat) //multiplies daily messages
        const BaseMaxMessages = dhelper.getDataInt("msgBase", 50, guildcat) //base amount of daily messages
        const msgChars = clamp(msg.content.length, 1, 500) //msg characters, maxxed at 500
        
        let xpInfo = < TypeObject<any> > dhelper.getDataObject(`${msg.author.id}_xpinfo`, {
            xp: 0,
            xpTo: 200,
            level: 0,
            lastMsg: new Date().getTime(),
            msgs: 0,
            maxMsgs: BaseMaxMessages,
            streak: 0,
            modifier: 1
        }, guildcat)
        
        const since = (new Date().getTime() / 1000) - (xpInfo.lastMsg / 1000)
        
        let add = (msgChars * XPMultiplier) * xpInfo.modifier
        
        xpInfo.xp = xpInfo.xp + add
        xpInfo.msgs++

        console.log(since)

        if (xpInfo.msgs <= xpInfo.maxMsgs) {
            xpInfo.modifier += msgChars * 0.0025
        }

        if (since >= 86400 && since < 127800) { // 24 hours to 48 hours
            xpInfo.streak = clamp(xpInfo.streak + 1, 0, 31)
            xpInfo.msgs = 0
            xpInfo.lastMsg = new Date().getTime()

            xpInfo.maxMsgs = clamp((xpInfo.streak * DailyMultiplierFactor) * BaseMaxMessages, BaseMaxMessages, Infinity)

            msg.channel.send(`Hello, <@${msg.author.id}>! Your streak has increased to ${xpInfo.streak} days!\n**Messages Today**: ${xpInfo.maxMsgs}`)
        } else if (since > 127800) { // missed a day (or multiple, but im lazy)
            xpInfo.streak = clamp(xpInfo.streak - 1, 0, 31)
            xpInfo.msgs = 0
            xpInfo.lastMsg = new Date().getTime()

            xpInfo.maxMsgs = clamp((xpInfo.streak * DailyMultiplierFactor) * BaseMaxMessages, BaseMaxMessages, Infinity) //linear messages increase :[

            msg.channel.send(`Oops, <@${msg.author.id}>... you seem to have missed a day.\n**Streak**: ${xpInfo.streak}\n**Messages Today**: ${xpInfo.maxMsgs}`)
        }

        if (xpInfo.xp >= xpInfo.xpTo) { // level up
            while (true) { //do a loop to level up. im sure there's a better way, but i'm not a mathematician
                xpInfo.level++
                xpInfo.xpTo *= XPLevelFactor

                if (xpInfo.xp < xpInfo.xpTo) { break }
            }

            msg.channel.send(`Congratulations, <@${msg.author.id}>! You've leveled up to level **${xpInfo.level}**!`)
        }

        guildcat.addData(`${msg.author.id}_xpinfo`, xpInfo)
    }

    if (spl[0] === `${prefix}help`) {
        
        const ind = Math.floor(Math.random() * helpReplyList.length)
        const catex = cbase.getCategory(spl[1])
        let hstring = `**${helpReplyList[ind]}** | Default prefix: \`${prefix}\`\nThe command's prefix is shown next to the command, e.g. \`${prefix}help\`\n`

        if (catex === undefined) { //not looking for a specific category
            hstring = `${hstring}Available Categories:\n`
            for (const cn in cbase.categories) {
                hstring = `${hstring}\t**${cn}** - loaded commands: \`${Object.keys(cbase.getCategory(cn).commands).length}\`\n` //bruh
            }
        } else { //looking for specific categories
            hstring = `${hstring}Loaded Commands in **${catex.name}**:\n`

            for (const cmn in catex.commands) {
                const cmd = catex.commands[cmn]

                hstring = `${hstring}\t**${cmd.prefix}${cmd.name}** - ${cmd.description}\n`
            }
        }

        safeSend(msg.channel, hstring)

    } else if (spl[0] === `${prefix}owoify`) {

        if (msg.guild?.member(msg.author)?.hasPermission('MANAGE_MESSAGES')) {
            switch(spl[1]) {
                case "none": 
                case "owo": 
                case "uwu": 
                case "uvu":
                    guildcat.addData("owolevel", spl[1])
                    safeSend(msg.channel, `Success! Changed owo level to ${spl[1]}.`)
                    break;
                case "0": 
                case "1": 
                case "2":
                case "3":
                    guildcat.addData("owolevel", owolevel[Number(spl[1])].toLowerCase())
                    safeSend(msg.channel, `Success! Changed owo level to ${guildcat.getData("owolevel")}`)
                    break
                default:
                    safeSend(msg.channel, `Invalid owo level (current: ${owolvl})`)
                    break
            }
        } else {
            safeSend(msg.channel, `You need Manage Messages to change this guild's owo level.`)
        }

    } else if (spl[0] === `${prefix}reload` && msg.author.id === "152906725350047746") {

        safeSend(msg.channel, ":repeat: Reloading commands, may take a second.")
        cmdList = getCommandList()
        safeSend(msg.channel, `:+1: Reloaded! Check ${prefix}help for any updated commands.`)

    } else if (typeof cmdList[spl[0]]?.callback === "function") {

        const res = cmdList[spl[0]].callback(msg)

        res.then((rsp) => {
            if (rsp.embed !== undefined) {
                safeSend(msg.channel, {embed: rsp.embed})
            } else {
                rsp.message = owolvl !== "none" ? rsp.message = owoify(rsp.message, owolvl) : rsp.message
                rsp.message = rsp.isReply ? `<@${msg.author.id}>, ` + rsp.message : rsp.message
        
                safeSend(msg.channel, rsp.message)
            }
        }).catch((err) => {
            throw err
        })
    }
}

// do the call backs when the call is back

client.once("ready", () => ready())
client.on("message", (msg) => onMessage(msg))

// pull the trigger piglet

client.login(token)

setInterval(() => {
    base.writeToFile("./save/main.json")
}, 10 * 1000)