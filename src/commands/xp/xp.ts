import { Message } from "discord.js";
import { getHelper } from "../..";
import { Command } from "../../commandhandler";
import { TypeObject } from "../../types";

const dhelper = getHelper()

exports.command = new Command({
    name: "xp",
    description: "Gets your XP stats",
    async callback(msg : Message) {
        let us;
        let firstUser = msg.mentions.users.first()

        if (firstUser !== undefined) {
            us = firstUser
        } else {
            us = msg.author
        }

        let guildcat;

        if(msg.guild?.id !== undefined) {
            guildcat = dhelper.getCategory(msg.guild?.id)
        } else {
            throw "What."
        }

        let xpInfo = < TypeObject<any> > dhelper.getDataObject(`${us.id}_xpinfo`, {
            xp: 0,
            xpTo: 200,
            level: 0,
            lastMsg: new Date().getTime(),
            msgs: 0,
            maxMsgs: 50,
            streak: 0,
            modifier: 1
        }, guildcat)

        const xpenabled = dhelper.getDataBool(`isLevellingEnabled`, false, guildcat)
        const xpfactor = dhelper.getDataInt(`xpFactor`, 1.5, guildcat)

        const XPOffset = xpInfo.xpTo / xpfactor
        const remaining = xpInfo.maxMsgs - xpInfo.msgs

        let xprep1 = Math.floor(((xpInfo.xp - XPOffset) / (xpInfo.xpTo - XPOffset)) * 10)
        xprep1 = xprep1 < 0 ? 0 : xprep1 //simple patch
        let xprep2 = 10 - xprep1

        console.log(xpInfo, xprep1, xprep2)
        
        return {
            isReply: false,
            message: "",
            embed: {
                color: 0x32cd32,
                title: `${xpInfo.xp.toFixed(2)} XP points`,
                author: {
                    name: `${us.username}'s profile`,
                    icon_url: us.avatarURL() || "https://cdn.discordapp.com/attachments/804826918377095178/813603854200995880/lol.jpg"
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
                    text: `XP is ${xpenabled === true ? "enabled" : "disabled"} | ${xpInfo.modifier.toFixed(2)}x multiplier | ${remaining < 0 ? 0 : remaining} messages left today`
                }
            }
        }
    }
})