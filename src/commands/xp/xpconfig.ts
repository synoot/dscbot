import { Message } from "discord.js";
import { getHelper } from "../..";
import { Command } from "../../commandhandler";

const dhelper = getHelper()

exports.command = new Command({
    name: "xpconfig",
    description: "XP settings",
    async callback(msg : Message) {
        const spl = msg.content.split(" ")
        const vr = spl[1] // should either be XPEnabled, XPMultiplier
        const vl = spl[2]
        
        let guildcat;

        if(msg.guild?.id !== undefined) {
            guildcat = dhelper.getCategory(msg.guild?.id)
        } else {
            throw "What."
        }

        if (!msg.guild.member(msg.author)?.hasPermission("MANAGE_MESSAGES")) {
            return {
                isReply: true,
                message: "you need `Manage Messages` to edit the XP config"
            }
        }

        switch(vr) {
            case "xpenabled":
                let v1 = vl.toLowerCase() === "true" //ye

                const old = dhelper.getDataBool("isLevellingEnabled", false, guildcat)
                guildcat.addData("isLevellingEnabled", String(v1))

                return {
                    isReply: true,
                    message: `successfully changed XPEnabled from ${old} to ${v1}`
                }
            case "xpmultiplier":
                let v2 = Number(vl.toLowerCase())

                if (isNaN(v2)) { 
                    return {
                        isReply: true,
                        message: "XPMultiplier must be a number"
                    }
                } else {
                    const old = dhelper.getDataInt("xpCharMult", 0.05, guildcat)
                    guildcat.addData("xpCharMult", String(v2))

                    return {
                        isReply: true,
                        message: `successfully changed XPMultiplier from **${old}** to **${String(v2)}**`
                    }
                }
            case "xpfactor":
                let v3 = Number(vl.toLowerCase())

                if (isNaN(v3)) {
                    return {
                        isReply: false,
                        message: "XPFactor must be a number"
                    }
                } else {
                    const old = dhelper.getDataInt("xpFactor", 1.5, guildcat)
                    guildcat.addData("xpFactor", String(v3))

                    return {
                        isReply: true,
                        message: `successfully changed XPFactor from **${old}** to **${String(v3)}**`
                    }
                }
            default:
                return {
                    isReply: true,
                    message: "valid options are XPEnabled and XPMultiplier (case insensitive)"
                }
        }
    }
})