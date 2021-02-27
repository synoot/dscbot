import { Message } from "discord.js";
import { getHelper } from "../..";
import { Command } from "../../commandhandler";
import { TypeObject } from "../../types";

const dhelper = getHelper()

const configs : TypeObject<Array<string>> = { // [type , variable]
    "multiplier_character": ["number", "xpCharMult"],
    "multiplier_daily": ["number", "msgMult"],
    "multiplier_level": ["number", "levelMult"],
    "daily_base": ["number", "msgBase"],
    "levelling_enabled": ["boolean", "isLevelling"],
}

exports.command = new Command({
    name: "xpconfig",
    description: "XP settings",
    async callback(msg : Message) {
        const spl = msg.content.split(" ")
        const vr = spl[1] // should either be XPEnabled, XPMultiplier
        let vl : any = spl[2]
        let vl_old = vl
        const cf = configs[vr]

        console.log(vr, configs[vr])
        
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

        if (cf !== undefined) {
            if (cf[0] === "number") {
                vl = Number(vl)
            } else if (cf[0] === "boolean") {
                vl = (vl === 'true') //vl = true == true, vl = false == false :)
            }

            //do some checking or something

            if ((isNaN(vl) && cf[0] === "number") || (vl !== "false" && vl !== "true" && cf[0] === "boolean")) {
                return {
                    isReply: true,
                    message: `the value for **${vr}** has to be a(n) ${cf[0]}, you gave **${vl_old}**`
                }
            }

            const old = guildcat.getData(cf[1])
            guildcat.addData(cf[1], String(vl))

            return {
                isReply: true,
                message: `successfully changed **${vr}** (from ${old} to ${String(vl)})`
            }
        } else {
            let hstring = "Available Config Options:\n"

            for (const cn in configs) {
                const cfa = configs[cn]

                hstring = `${hstring}\t**${cn}** - type: **${cfa[0]}**\n`
            }

            return {
                isReply: false,
                message: hstring
            }
        }
    }
})