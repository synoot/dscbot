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
}

const helper = index.getDHelper()

exports.command = new command.Command({
    name: "xpreward",
    description: "Reward roles based on level.",
    async callback(msg : Message) {
        const guildcat = helper.getCategory(<string>msg.guild?.id)

        const spl = msg.content.split(" ")
        let role = spl[1]
        let level = spl[2]

        let roleid = role.substr(3, role.length - 4)

        console.log(role, level, Number(level))

        // checks if the role ping is correct, if the author has the Manage Messages permission, if the level is not NaN (contains letters), and if the level is not a space.
        if ((role.substr(0, 3) === "<@&" && role.substr(role.length - 1) == ">") && msg.guild?.member(msg.author)?.hasPermission("MANAGE_MESSAGES") && !isNaN(Number(level)) && level.trim() !== "") {
            const xpOptions = < TypeObject<any> > guildcat.getData("xpOptions")

            if (xpOptions) {
                xpOptions.xpRewards[level] = roleid
                
                guildcat.addData("xpOptions", xpOptions)

                return {
                    isReply: true,
                    message: `will now award role ${role} at level **${level}**`
                }
            } else {
                return {
                    isReply: true,
                    message: "this guild may be bugged, as it lacks a category. Please try again."
                }
            }
        } else if (!msg.guild?.member(msg.author)?.hasPermission("MANAGE_MESSAGES")) {
            return {
                isReply: true,
                message: "you do not have the Manage Messages permission."
            }
        } else {
            return {
                isReply: true,
                message: "usage: xpreward <@role> <level>"
            }
        }
    }
})