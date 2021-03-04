import command from "../../command";
import index from "../../index"
import { TypeObject } from "../../types";

const dataHelper = index.getDHelper()

module.exports = {
    command: new command.Command({
        name: "xp",
        description: "XP stats!",
        async callback(msg) {
            const guildcat = dataHelper.getCategory(<string>msg.guild?.id) // guild is guaranteed to exist since it isn't called if guild doesn't exist
            const xpInfo = < TypeObject<any> | undefined > guildcat.getData(`${msg.author.id}_xpInfo`)
            const xpOptions = < TypeObject<any> > guildcat.getData(`xpOptions`)

            let user = msg.mentions.users.first()
            
            user = user === undefined ? msg.author : user
            
            if (xpInfo) {
                let XPOffset = xpInfo.xpTo / xpOptions.levelMult
                
                XPOffset = xpInfo.level === 0 ? 0 : XPOffset

                const remaining = xpInfo.maxMsgs - xpInfo.msgs
                let xprep1 = Math.floor(((xpInfo.xp - XPOffset) / (xpInfo.xpTo - XPOffset)) * 10)
                xprep1 = xprep1 < 0 ? 0 : xprep1 //simple patch
                let xprep2 = 10 - xprep1
                return {
                    isReply: false,
                    message: "",
                    embed: {
                        color: 0x32cd32,
                        title: `${xpInfo.xp.toFixed(2)} experience`,
                        author: {
                            name: `${user.username}'s profile`,
                            icon_url: user.avatarURL() || "https://cdn.discordapp.com/attachments/804826918377095178/813603854200995880/lol.jpg"
                        },
                        fields: [
                            {
                                name: "Current Level",
                                value: xpInfo.level,
                                inline: true
                            },
                            {
                                name: "XP For Next Level",
                                value: `${xpInfo.xpTo.toFixed(2)} XP`,
                                inline: true
                            },
                            {
                                name: "XP Progress",
                                value: `[ ${"■".repeat(xprep1)}${"□".repeat(xprep2)} ]`,
                                inline: true
                            }
                        ],
                        footer: {
                            text: `XP is ${xpOptions.enabled === true ? "enabled" : "disabled"} | ${xpInfo.modifier.toFixed(2)}x multiplier | ${remaining < 0 ? 0 : remaining} messages left today`
                        }
                    }
                }
            } else {
                return {
                    isReply: true,
                    message: "you do not have a profile!\nIf possible, enable levelling using xpconfig."
                }
            }
        }
    })
}