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

// WE DO A BIT OF LOADING

const config : TypeObject<any> = fhelper.readFile("./save/config.json")
const prefix = <string>config.prefix

let mode = process.argv[2]

if (mode === undefined) { mode = "prod" }
if (mode !== "dev" && mode !== "prod") { mode = "prod"; console.log("Warning: The only avaliable modes are 'prod' and 'dev', assuming production.") }

const token = <string>config[`token_${mode}`]

// couple of getters

export function getPrefix() { return prefix }
export function getHelper() { return dhelper }

// config idk

if (prefix === undefined || token === undefined) { throw "Config is incorrect!" }

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

    if (msg.author === client.user) return
    if (guildID === undefined) throw "How."

    const guildcat = dhelper.getCategory(guildID)
    const owolvl = dhelper.getData("owolevel", "none", guildcat)

    const levellingEnabled = dhelper.getDataBool("isLevellingEnabled", false, guildcat)

    // XP levelling

    if (levellingEnabled === true) {
        const XPModifier = dhelper.getDataInt(`${msg.author.id}_modifier`, 1, guildcat)
        const XPMultiplier = dhelper.getDataInt("xpCharMult", 0.1, guildcat) //Multiplies the characters in the message by this amount to award XP
        const XPLevelFactor = dhelper.getDataInt("xpFactor", 1.5, guildcat)
        const msgChars = msg.content.length

        let xpToLevel = dhelper.getDataInt(`${msg.author.id}_xpto`, 200, guildcat)
        let level = dhelper.getDataInt(`${msg.author.id}_level`, 0, guildcat)
        let uxp = dhelper.getDataInt(`${msg.author.id}_xp`, 0, guildcat)
        let add = ((msgChars * XPMultiplier) * XPModifier)

        uxp = uxp + add

        console.log(`${msg.author.id} author\n${XPModifier} daily xp modifier\n${dhelper.getDataInt(`${msg.author.id}_xp`, 0, guildcat)} author's xp\n${XPMultiplier} multiplier per msg chars\n${level} author's level\n${xpToLevel} xp to next level\n${msgChars} msg characters\n${add} gained XP`)
        
        if (uxp >= xpToLevel) { // level up
            level++
            xpToLevel = xpToLevel * XPLevelFactor

            guildcat.addData(`${msg.author.id}_xpto`, String(xpToLevel))
            guildcat.addData(`${msg.author.id}_level`, String(level))

            console.log(`${xpToLevel} xp to level after level up\n${level} level\n${XPLevelFactor} level factor`)

            msg.channel.send(`Congratulations, <@${msg.author.id}>! You've leveled up to level **${level}**!`)
        }

        guildcat.addData(`${msg.author.id}_xp`, String(uxp))
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