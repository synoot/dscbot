import { Message } from "discord.js";
import { getHelper } from "../..";
import { Command } from "../../commandhandler";
import { Category } from "../../datahandler";
import { CommandResponse, TypeObject } from "../../types";

const dhelper = getHelper()

exports.command = new Command({
    name: "rolerewards",
    description: "Sets role rewards.",
    async callback(msg : Message) {
        const spl = msg.content.split(" ")
        const roleid = spl[1] // <@&role_id>
        let level = spl[2]

        level = level.trim() === "" ? "a" : level // force it to be NaN

        let guildcat : Category

        console.log(roleid, level)

        if (msg.guild?.id !== undefined) {
            guildcat = dhelper.getCategory(msg.guild.id)
        } else {
            return {
                isReply: false,
                message: "This can only be run in a guild."
            }
        }

        if(isNaN(Number(level))) {
            return {
                isReply: true,
                message: "the level you specified must be a number (usage: rolerewards <role> <level>)"
            }
        }

        if (roleid.substr(0, 3) !== "<@&" || roleid.substr(roleid.length - 1) !== ">") {
            return {
                isReply: true,
                message: "you must ping a role to reward (usage: rolerewards <role> <level>)"
            }
        } else {
            return msg.guild.roles.fetch(roleid.slice(3, roleid.length - 1)).then(role => {
                const rewards = < TypeObject<any> > dhelper.getDataObject("xp_rewards", {}, guildcat)

                rewards[level] = role?.id

                const promise = new Promise<CommandResponse>(function(resolve, reject) {
                    if (role?.id !== undefined) {
                        resolve({
                            isReply: true,
                            message: `role ${role} will be awarded at level **${level}**`
                        })
                    } else {
                        reject({
                            isReply: true,
                            message: `Error? Role does not have an ID`
                        })
                    }
                })

                return promise
            }).catch(err => {
                return {
                    isReply: true,
                    message: `unable to fetch role, error:\n\`\`\`${err}\`\`\``
                }
            })
        }        
    }
})