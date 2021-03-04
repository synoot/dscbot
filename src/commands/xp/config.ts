import { Message } from "discord.js";
import { TypeObject } from "../../types";
import command from "../../command";
import index from "../../index"

const configs : TypeObject<Array<string>> = { // [type , variable]
    "multiplier_character": ["number", "xpCharMult"],
    "multiplier_daily": ["number", "msgMult"],
    "multiplier_dailycharacter": ["number", "dailyCharMult"],
    "multiplier_level": ["number", "levelMult"],
    "daily_base": ["number", "msgBase"],
    "levelling_enabled": ["boolean", "enabled"],
    "xp_channel": ["channel", "xpChannel"]
}

const helper = index.getDHelper()

exports.command = new command.Command({
    name: "xpconfig",
    description: "Change XP settings.",
    async callback(msg : Message) {
        const guildcat = helper.getCategory(<string>msg.guild?.id)

        const spl = msg.content.split(" ")
        const variable = spl[1]
        const value : any = spl[2]

        const change = configs[variable]

        if (change && msg.guild?.member(msg.author)?.hasPermission("MANAGE_MESSAGES")) {
            const xpOptions = < TypeObject<any> > guildcat.getData("xpOptions")

            if (xpOptions) {
                const type = change[0]

                let v = type === "number" ? Number(value) : type === "boolean" ? value === "true" : type === "channel" ? value.slice(2, value.length - 1) : value

                if ((isNaN(value) && type === "number") || (value !== "false" && value !== "true" && type === "boolean") || ((value.substr(0, 2) !== "<#" || value.substr(value.length - 1) !== ">") && type === "channel")) {
                    return {
                        isReply: true,
                        message: `${variable}'s value must be a(n) ${type}.`
                    }
                } else {
                    xpOptions[change[1]] = v
                    guildcat.addData("xpOptions", xpOptions)

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