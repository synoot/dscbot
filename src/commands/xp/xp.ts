import { Message } from "discord.js";
import { getHelper } from "../..";
import { Command } from "../../commandhandler";

const dhelper = getHelper()

exports.command = new Command({
    name: "xp",
    description: "Gets your XP stats",
    async callback(msg : Message) {
        let guildcat;

        if(msg.guild?.id !== undefined) {
            guildcat = dhelper.getCategory(msg.guild?.id)
        } else {
            throw "What."
        }

        let xpToLevel = dhelper.getDataInt(`${msg.author.id}_xpto`, 200, guildcat)
        let level = dhelper.getDataInt(`${msg.author.id}_level`, 0, guildcat)
        let uxp = dhelper.getDataInt(`${msg.author.id}_xp`, 0, guildcat)

        return {
            isReply: false,
            message: "",
            embed: {
                color: 0x32cd32,
                title: `${uxp.toFixed(2)} XP points`,
                author: {
                    name: `${msg.author.username}'s profile`,
                    icon_url: msg.author.avatarURL() || "https://cdn.discordapp.com/attachments/804826918377095178/813603854200995880/lol.jpg"
                },
                fields: [
                    {
                        name: "Current Level",
                        value: level,
                        inline: true
                    },
                    {
                        name: "XP To Next Level",
                        value: `${xpToLevel} XP`,
                        inline: true
                    }
                ]
            }
        }
    }
})