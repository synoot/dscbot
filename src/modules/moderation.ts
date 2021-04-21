//
// Moderation Module - contains moderation commands and has an optional filter.
//

import djs from "discord.js"
import modules from "../modules"
import command from "../command"
import index from "../index"
import { AuditLogDetails, TypeObject } from "../types"

const dhelper = index.getDHelper()
const lengthToMultiplier : { [index : string] : number } = {
    "s": 1,
    "m": 60,
    "h": 3600,
    "d": 86400
}

// common functions

function parseTime(input : string) {
    //input usually follows the format Xs/m/h/d

    // with input "10m", t = 10 and l = "m"

    console.log(input)

    const t = Number(input.substring(0, input.length - 1)) //e.g.
    const l = input.substring(input.length - 1).toLowerCase()

    if (isNaN(t)) { return "invalid time (must be a number)" }
    if (lengthToMultiplier[l] === undefined) { return "invalid length (must be a letter, either 's' for seconds, 'm' for minutes, 'h' for hours, 'd' for days)" }
    
    return (t * lengthToMultiplier[l]) * 1000 //get milliseconds because idk
}

function parseUser(input : string) {
    // input either <@XXX> or XXX, expects a djs.UserResolvable

    console.log(input)

    let id;
    
    if (!isNaN(Number(input))) { //checks if the input is a number, therefore it's an ID
        id = input
    } else {
        let parsedID = input.substring(2, input.length - 1) // <@XXXX>
        console.log(parsedID)
        
        if (isNaN(Number(parsedID))) {
            parsedID = input.substring(3, input.length - 1) // <@!XXXX> (nicknamed)
            if (isNaN(Number(parsedID))) {
                return "invalid user id, must be <@id> (normal mention) or id"
            }
        }

        id = parsedID
    }

    return index.client.users.cache.get(id)
}

async function modlog(details : AuditLogDetails) {
    const guildcat = dhelper.getCategory(details.guild.id)
    const logOptions = guildcat.getData("logOptions")

    if (logOptions instanceof Object && !(logOptions instanceof Array)) {
        const logChannel = logOptions.logChannel
        const channel = details.guild.channels.cache.get(logChannel) as djs.TextChannel | undefined

        if (channel) {
            channel.send({ embed : {
                color: details.color || 0x4192fc,
                title: 'Moderation Log',
                author: {
                    name: `${details.sender.username}#${details.sender.discriminator}`,
                    icon_url: details.sender.displayAvatarURL() || "https://cdn.discordapp.com/attachments/821138398126538833/821138445413253180/lol.jpg" //default avatar url
                },
                description: details.description || "*No description provided.*",
                fields: (details.arguments !== undefined ? 
                [
                    {
                        name: "Arguments",
                        value: details.arguments.join(", ")
                    }
                ] 
                : undefined),
                timestamp: details.date,
                footer: {
                    text: 'Moderation features supplied by (placeholder bot name)',
                    icon_url: index.client.user?.displayAvatarURL() || "https://cdn.discordapp.com/attachments/821138398126538833/821138445413253180/lol.jpg" 
                }
            }})
        }
    }

}

// check if the guild has a muted role - if not, it makes one and returns it (right over the @everyone role)

async function getMutedRole(guild : djs.Guild) : Promise<djs.Role | string> {

    if (!guild.member(index.client.user as djs.User)?.hasPermission("MANAGE_ROLES")) { return "lacking the ability to manage roles (permission: Manage Roles)" }

    const guildcat = dhelper.getCategory(guild.id)
    let role = guildcat.getData("mutedRoleID") as djs.Role | string | undefined | null
    let guildRole = (role !== null) ? await guild.roles.fetch(role as string) : null
    let roleInvalidated = (!role) || (isNaN(Number(role))) || guildRole === null

    // all of the typescript shit above is a fail on my part its so ugly

    if (roleInvalidated) {
        role = await guild.roles.create({
            data: {
                name: "Muted",
                color: 0x444444,
                hoist: false,
                mentionable: false,
                permissions: new djs.Permissions(djs.Permissions.DEFAULT).remove("SEND_MESSAGES")
            },
            reason: "Muted role did not exist beforehand"
        })

        guild.channels.cache.forEach((channel) => {
            channel.createOverwrite(role as djs.Role, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                READ_MESSAGE_HISTORY: false,
                CONNECT: false,
            }, "Muted role overrides")
        })
    } else { role = guildRole }

    guildcat.addData("mutedRoleID", <string>role?.id)

    return role as djs.Role
}

// commands

const configs : TypeObject<Array<string>> = { // [type , variable]
    "log_channel": ["channel", "logChannel"],
    "log_verbose": ["boolean", "logVerbose"],
    "log_enabled": ["boolean", "logEnabled"]
}

const commandMute = new command.Command({
    name: "mute",
    description: `${index.getPrefix()}mute <user @ / user id> <duration (Xs/m/h/d)> <reason> ex. ${index.getPrefix()}mute 152906725350047746 5m you suck | Outputs the supplied reason to the moderation log, and the moderator who used it.`,
    callback: async (msg) => {
        const aUser = msg.guild?.member(msg.author)
        const botUser = msg.guild?.member(index.client.user as djs.User)
        const guildCat = dhelper.getCategory(msg.guild?.id as string)

        if (!aUser?.hasPermission("MANAGE_ROLES") || !aUser?.hasPermission("MANAGE_MESSAGES")) { return { isReply: true, message: "you need both the Manage Roles permission and the Manage Messages permission to mute members." } }
        if (!botUser?.hasPermission("MANAGE_ROLES") || !botUser.hasPermission("MANAGE_MESSAGES")) { return { isReply: true, message: "I lack Manage Roles and Manage Messages, so I cannot run this command."} } 

        let splMsg = msg.content.split(" ")
        let userMention : djs.User | string | undefined = splMsg[1] // user @ / id
        let duration : string | number = splMsg[2] // Xs/m/h/d
        let reason = splMsg.slice(3).join(" ") // joins the rest of the array together into a string

        if (userMention === undefined) { return { isReply: true, message: "you must supply a user either as a mention (@xxx) or their ID" } }
        if (duration === undefined) { return { isReply: true, message: "you must supply a duration in the format Xs/m/h/d (seconds, minutes, hours, days)" } }

        userMention = parseUser(userMention)

        if (typeof userMention === "string") { return { isReply: true, message: userMention } } //userMention is an error message in this case
        if (userMention === undefined) { return { isReply: true, message: "user is undefined. Perhaps they are not in this server, or are not known by this bot? Try again."}} //user is not in cache
        if (!aUser?.hasPermission("MANAGE_MESSAGES")) { return { isReply: true, message: "you lack the Manage Messages permission." } }

        duration = parseTime(duration)

        if (typeof duration === "string") { return { isReply: true, message: duration } } //once again, it's an error message in this case

        let guildTargetMember = msg.guild?.member(userMention)

        if (guildTargetMember === null) { return { isReply: true, message: "that user doesn't seem to be in this server." }}

        let mutedRole = await getMutedRole(msg.guild as djs.Guild)

        if (typeof mutedRole === "string") { return { isReply: true, message: mutedRole } }

        //everything should be here - the target, length, and role

        if (guildTargetMember?.roles.cache.get(mutedRole.id)) { return { isReply: true, message: "this user is already muted!" } }

        guildCat.addData(`${guildTargetMember?.id}_mute`, new Date().getTime() + duration)
        guildTargetMember?.roles.add(mutedRole, `Member was muted by ${msg.author.username}#${msg.author.discriminator} for reason: ${reason}`);

        const arr = dhelper.getData(`muted`, [], guildCat) as any[]
        arr.push(guildTargetMember?.id)

        guildCat.addData(`muted`, arr)

        modlog({
            date: new Date().getTime(),
            sender: msg.author,
            guild: msg.guild as djs.Guild,
            arguments: [`<@${userMention.id}>`, splMsg[2], `"${reason}"`],
            description: `Muted \`${userMention.username}#${userMention.discriminator}\` (<@${userMention.id}>) for reason: "${reason}"`
        })
        
        return {
            isReply: true,
            message: `muted <@${userMention.id}> for ${duration / 1000} seconds`
        }
    }
})

const commandLog = new command.Command({
    name: "logconfig",
    description: "Options for the moderation log.",
    callback: async (msg : djs.Message) => {
        const guildCat = dhelper.getCategory(<string>msg.guild?.id)
        const spl = msg.content.split(" ")

        const variable = spl[1]
        const value : any = spl[2]

        const change = configs[variable]

        if (change && msg.guild?.member(msg.author)?.hasPermission("MANAGE_MESSAGES")) {
            const logOptions = < TypeObject<any> > dhelper.getData("logOptions", {}, guildCat)

            if (logOptions) {
                const type = change[0]

                let v = type === "number" ? Number(value) : type === "boolean" ? value === "true" : type === "channel" ? value.slice(2, value.length - 1) : value

                if ((isNaN(value) && type === "number") || (value !== "false" && value !== "true" && type === "boolean") || ((value.substr(0, 2) !== "<#" || value.substr(value.length - 1) !== ">") && type === "channel")) {
                    return {
                        isReply: true,
                        message: `${variable}'s value must be a(n) ${type}.`
                    }
                } else {
                    logOptions[change[1]] = v
                    guildCat.addData("logOptions", logOptions)

                    return {
                        isReply: true,
                        message: `changed ${variable} to ${value}`
                    }
                }
            } else {
                return {
                    isReply: true,
                    message: "this guild may be bugged, as it lacks a category. Please try again."
                }
            }
        } else if (!change) {
            let str = "available options:\n"

            for (const opt in configs) {
                str = `${str}\t**${opt}** : **${configs[opt][0]}**\n`
            }

            return {
                isReply: true,
                message: str
            }
        } else {
            return {
                isReply: true,
                message: "you do not have the Manage Messages permission."
            }
        }
    }
})

const module_moderation = new modules.Module({
    name: "moderation",
    description: "Provides moderation commands, and has it's own custom detailed audit log.",
    main: async () => {},
    loop: async () => {
        // check muted (it's assumed that every top level category in the default database is a guild category - it should stay that way)
        return dhelper.base.categories.forEach(async (cat) => {
            const guild = await index.client.guilds.fetch(cat.name)
            const role = await getMutedRole(guild)

            if (typeof role === "string") { throw role }

            const mutedArr = cat.getData('muted')
            let newArr = [] //arr with updated mutes

            // console.log(mutedArr, mutedArr instanceof Array)

            if (mutedArr instanceof Array) {
                // it is definitely an array

                for (let x = 0; x < mutedArr.length; x++) {
                    const mutedDuration = cat.getData(`${mutedArr[x]}_mute`)
                    // console.log(x, mutedArr[x], mutedDuration)

                    if (mutedDuration) {
                        // console.log(mutedDuration, new Date().getTime())

                        if (Number(mutedDuration) > new Date().getTime()) {
                            newArr.push(mutedArr[x])
                        } else {

                            if (guild !== null) {
                                const member = guild.member(mutedArr[x])

                                if (member) {
                                    member.roles.remove(role, "Mute duration over").catch((res) => { console.error(res) })
                                    modlog({
                                        date: new Date().getTime(),
                                        sender: index.client.user as djs.User,
                                        guild: guild,
                                        description: `Unmuted member \`${member.user.username}#${member.user.discriminator}\` (<@${member.id}>) automatically.`
                                    })
                                }
                            } else {
                                throw "What the fuck"
                            }
                        }
                    }
                }
            }

            cat.addData('muted', newArr)
        })
    },
    commands: [ commandMute, commandLog ]
})

exports.module = module_moderation