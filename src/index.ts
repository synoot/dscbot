import requireDir from "require-dir";
import djs, { Message, MessageEmbed } from "discord.js";
import { Base } from "./datahandler";
import { FileHelper } from "./filehelper";
import { TypeObject, CommandResponse } from "./types";
import { Command } from "./commandhandler";
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
const fhelper = new FileHelper();
const dhelper = new DataHelper(base);

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
    let commands : { [index : string] : { command : Command } } = requireDir("./commands", { noCache: true })
    let list : TypeObject<Command> = {}

    for (let p in commands) {
        let c : Command = commands[p]?.command
        list[`${c.prefix}${c.name}`] = c
    }

    return list
}

//send da messge

function safeSend(msg : Message, content : any) {
    console.log(content)
    msg.channel.send(content).catch((err) => {
        console.log(`Error:\n${err}\nWill attempt to send.`)
        msg.channel.send(`Error!\n${err}`).catch((err) => {
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
    const lvl = dhelper.getData("owolevel", "none", guildcat)

    if (spl[0] === `${prefix}help`) {
        
        const ind = Math.floor(Math.random() * helpReplyList.length)
        const categories : TypeObject<TypeObject<Command>> = {};
        let hstring = `**${helpReplyList[ind]}** | Default prefix: \`${prefix}\`\nThe command's prefix is shown next to the command, e.g. \`${prefix}help\`\n`

        for (let c in cmdList) { //I want to objectify this SO BADLY.
            const cmd : Command = cmdList[c]
            let cat = categories[cmd.category]

            if (cat === undefined) { categories[cmd.category] = {}; cat = categories[cmd.category]}

            cat[cmd.name] = cmd
        }

        for (let cn in categories) {
            const cat = categories[cn]

            hstring = `${hstring}**${cn}**:\n` // **categoryName**:

            for (let cmd_n in cat) {
                const cmd = cat[cmd_n]

                hstring = `${hstring}\t**${cmd.prefix}${cmd.name}** - ${cmd.description}\n` //    **(prefix)cmdName** - cmdDescription
            }
        }

        hstring = lvl !== "none" ? hstring = owoify(hstring, lvl) : hstring
        safeSend(msg, hstring)

    } else if (spl[0] === `${prefix}owoify`) {

        if (msg.guild?.member(msg.author)?.hasPermission('MANAGE_MESSAGES')) {
            switch(spl[1]) {
                case "none": 
                case "owo": 
                case "uwu": 
                case "uvu":
                    guildcat.addData("owolevel", spl[1])
                    safeSend(msg, `Success! Changed owo level to ${spl[1]}.`)
                    break;
                case "0": 
                case "1": 
                case "2":
                case "3":
                    guildcat.addData("owolevel", owolevel[Number(spl[1])].toLowerCase())
                    safeSend(msg, `Success! Changed owo level to ${guildcat.getData("owolevel")}`)
                    break
                default:
                    safeSend(msg, `Invalid owo level (current: ${lvl})`)
                    break
            }
        } else {
            safeSend(msg, `You need Manage Messages to change this guild's owo level.`)
        }

    } else if (spl[0] === `${prefix}reload` && msg.author.id === "152906725350047746") {

        safeSend(msg, ":repeat: Reloading commands, may take a second.")
        cmdList = getCommandList()
        safeSend(msg, `:+1: Reloaded! Check ${prefix}help for any updated commands.`)

    } else if (typeof cmdList[spl[0]]?.callback === "function") {

        const res : CommandResponse = cmdList[spl[0]].callback(msg)

        if (res.embed !== undefined) {
            safeSend(msg, {embed: res.embed})
        } else {
            res.message = lvl !== "none" ? res.message = owoify(res.message, lvl) : res.message
            res.message = res.isReply ? `<@${msg.author.id}>, ` + res.message : res.message
    
            safeSend(msg, res.message)
        }

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