//
// Moderation Module - contains moderation commands and has an optional filter.
//

import djs from "discord.js"
import modules from "../modules"
import command from "../command"
import index from "../index"
import { TypeDataCategory } from "../types"

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

        guildCat.addData(`${msg.author.id}_mute`, new Date().getTime() + duration)
        guildTargetMember?.roles.add(mutedRole, `Member was muted by ${msg.author.username}#${msg.author.discriminator}`)

        return {
            isReply: true,
            message: `muted ${guildTargetMember?.nickname || userMention.username} for ${duration / 1000} seconds`
        }
    }
})

const module_moderation = new modules.Module({
    name: "moderation",
    description: "Provides moderation commands, and has it's own custom detailed audit log.",
    main: async () => {},
    commands: [ commandMute ]
})

exports.module = module_moderation