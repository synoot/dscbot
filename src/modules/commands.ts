//
// Command Module - Cannot be disabled, contains help, reload, and executes commands.
//

import djs from "discord.js"
import modules from "../modules"
import index from "../index"
import command from "../command"

const chandler = index.getCHandler() // command handler, contains base and categories
const mbase = index.getModuleBase()
const prefix = index.getPrefix()

async function main(msg : djs.Message, client : djs.Client) {
    const spl = msg.content.split(" ")
    let cmdn = spl[0].substr(prefix.length)

    const mcmd = index.getModuleCmdList()

    let cmd = mcmd.get(cmdn)
    cmd = cmd ? cmd : chandler.getCommand(cmdn)

    if (cmd) {
        if (cmd.prefix === msg.content.substr(0, prefix.length)){ /* this command matches, check the prefix */
            const res = await cmd.callback(msg)

            if (res.embed !== undefined) {
                index.safeSend(msg, {embed: res.embed})
            } else {
                res.message = res.isReply === true ? `${msg.author}, ${res.message}` : res.message
    
                if (res.users) {
                    for (let i = 0; i < res.users.length; i++) {
                        res.message = res.message.replace(";", `<@${res.users[i]}>`)
                    }
                }

                index.safeSend(msg, res.message)
            }
        }
    }
}

const commandHelp = new command.Command({
    name: "help",
    description: "This command!",
    callback: async (msg : djs.Message) => {
        const spl = msg.content.split(" ")

        const sc /* selected category */ = chandler.getCategory(spl[1])
        const sm /* selected module */ = mbase.getModule(spl[1])
        const cats /* categories */ = chandler.getCategories()
        let hstring /* help string */ = `Default prefix: \`${prefix}\`\nThe prefix for a command is next to it's name, ex: \`${prefix}help\`\n\n`

        if (sm) { // module
            hstring = `${hstring}**${sm.name} (${sm.enabled === true ? "Enabled" : "Disabled"})**:\n`
            if (sm.commands.size > 0) {
                sm.commands.forEach((cmd) => { hstring = `${hstring}\t**${cmd.prefix}${cmd.name}** - **${cmd.description}**\n`})
            } else {
                hstring = `${hstring}**\tNo loaded commands.`
            }
        } else if (sc) { // specific category
            if (sc.commands.size > 0) {
                hstring = `${hstring}**${sc.name}**:\n`
                sc.commands.forEach((cmd) => { hstring = `${hstring}\t**${cmd.prefix}${cmd.name}** - **${cmd.description}**\n` })
            } else {
                hstring = `${hstring}**${sc.name}**:\n\tNo loaded commands.`
            }
        } else { // no category
            if (mbase.modules.size > 0) {
                hstring = `${hstring}Modules:\n`
    
                mbase.modules.forEach((m, n) => {
                    hstring = `${hstring}\t**${n} (${m.enabled === true ? "Enabled" : "Disabled"})**\n\t\t**${m.description}**\n\t\t\tPath: \`${m.debugPath}\`\n\t\t\tTotal commands: \`${m.commands.size}\`\n\n`
                })
            }

            hstring = `${hstring}Categories:\n`
            cats.forEach((cat) => { if (cat.commands.size > 0) { hstring = `${hstring}\t**${cat.name}** - total commands: **${cat.commands.size}**\n` } })
        }

        return {
            isReply: false,
            message: hstring
        }
    }
})

const commandReload = new command.Command({
    name: "reload",
    description: "Reloads commands & modules",
    callback: async (msg : djs.Message) => {
        if (msg.author.id === index.getOwner()) {
            index.safeSend(msg, ":+1: Reloading! Give it a second.")
            await index.refreshCommands()
            return {
                isReply: false,
                message: ":repeat: All done. Check `-help` to see any new commands or modules."
            }
        } else {
            return {
                isReply: true,
                message: "you must be the bot's owner to use this command."
            }
        }
    }
})

const commandDisable = new command.Command({
    name: "disable",
    description: "Attempts to disable a module.",
    callback: async (msg: djs.Message) => {
        let retMessage = ""

        const user = <djs.GuildMember>msg.guild?.member(msg.author)

        if (!user.hasPermission("MANAGE_MESSAGES")) {
            return {
                isReply: true,
                message: "you lack the Manage Messages permission."
            }
        }

        const spl = msg.content.split(" ")
        const mod = spl[1] //should be a module name

        const mod_c = mbase.getModule(mod)

        if (mod_c) {
            if (mod_c.canDisable) {
                mod_c.enabled = false
                retMessage = `disabled module \`${mod_c.name}\`.`
            } else {
                retMessage = "this module cannot be disabled."
            }
        } else {
            retMessage = "you did not pass a valid message."
        }

        return {
            isReply: true,
            message: retMessage
        }
    }
})

const commandEnable = new command.Command({
    name: "enable",
    description: "Attempts to enable a module.",
    callback: async (msg: djs.Message) => {
        let retMessage = ""

        const user = <djs.GuildMember>msg.guild?.member(msg.author)

        if (!user.hasPermission("MANAGE_MESSAGES")) {
            return {
                isReply: true,
                message: "you lack the Manage Messages permission."
            }
        }

        const spl = msg.content.split(" ")
        const mod = spl[1] //should be a module name

        const mod_c = mbase.getModule(mod)

        if (mod_c) {
            mod_c.enabled = true
            retMessage = `enabled module \`${mod_c.name}\`.`
        } else {
            retMessage = "you did not pass a valid message."
        }

        return {
            isReply: true,
            message: retMessage
        }
    }
})

const e_module = new modules.Module({
    name: "commands",
    description: "Commands - resolves commands and adds some utility commands.",
    main: main,
    disableable: false,
    commands: [
        commandHelp,
        commandReload,
        commandEnable,
        commandDisable
    ]
})

exports.module = e_module