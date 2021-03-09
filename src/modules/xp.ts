//
// XP Module - handles levelling up. Command Exports:
// xp, xpconfig, xpreward
//

import djs from "discord.js"
import index from "../index"
import command from "../command"
import { TypeObject } from "../types"

const clamp = (num : number, min : number, max : number) => Math.min(Math.max(num, min), max)

const dhelper = index.getDHelper()

async function main(msg : djs.Message, guildid : string) {
    const guildcat = dhelper.getCategory(guildid)

    const xpOptions = < TypeObject<any> > dhelper.getData("xpOptions", {
        enabled: true,
        xpRewards: {},
        xpCharMult: 0.1,
        dailyCharMult: 0.0025,
        levelMult: 1.2,
        msgMult: 2,
        msgBase: 50,
        xpChannel: 0,
    }, guildcat)

    if (xpOptions.enabled) {
        const xpInfo = < TypeObject<any> > dhelper.getData(`${msg.author.id}_xpInfo`, {
            xp: 0,
            xpTo: 200,
            level: 0,
            lastMsg: new Date().getTime(),
            spamLastMsg: new Date().getTime(), 
            msgs: 0,
            maxMsgs: xpOptions.msgBase,
            streak: 0,
            modifier: 1
        }, guildcat)
        const msgChars = clamp(msg.content.length, 0, 500)
        const since = (new Date().getTime() / 1000) - (xpInfo.lastMsg / 1000)
    
        if ((new Date().getTime() / 1000) - (xpInfo.spamLastMsg / 1000) >= 15) {
            xpInfo.xp = xpInfo.xp + ((msgChars * xpOptions.xpCharMult) * xpInfo.modifier)
            xpInfo.msgs++
    
            if (xpInfo.msgs <= xpInfo.maxMsgs) {
                xpInfo.modifier += msgChars * xpOptions.dailyCharMult
            }
    
            if (since >= 86400 && since < 127800) { // 24 hours to 48 hours
                xpInfo.streak = clamp(xpInfo.streak + 1, 0, 31)
                xpInfo.msgs = 0
                xpInfo.lastMsg = new Date().getTime()
    
                xpInfo.maxMsgs = clamp((xpInfo.streak * xpOptions.msgMult) * xpOptions.maxMsgs, xpOptions.maxMsgs, Infinity)
            } else if (since > 127800) { // missed a day (or multiple, but im lazy)
                xpInfo.streak = clamp(xpInfo.streak - 1, 0, 31)
                xpInfo.msgs = 0
                xpInfo.lastMsg = new Date().getTime()
    
                xpInfo.maxMsgs = clamp((xpInfo.streak * xpOptions.msgMult) * xpOptions.maxMsgs, xpOptions.maxMsgs, Infinity)
            }
    
            if (xpInfo.xp >= xpInfo.xpTo) { // level up
                let newRoles : any[] = []
    
                while (xpInfo.xp >= xpInfo.xpTo) { //do a loop to level up. im sure there's a better way, but i'm not a mathematician
                    xpInfo.level++
                    xpInfo.xpTo *= xpOptions.levelMult
    
                    if (xpOptions.xpRewards[String(xpInfo.level)] !== undefined) {
                        await msg.guild?.roles.fetch(xpOptions.xpRewards[String(xpInfo.level)]).then(role => {
                            if (role) { msg.member?.roles.add(role); newRoles.push(role); newRoles.push(xpInfo.level) }
                        }).catch(err => {
                            index.safeSend(msg, "Unable to give you a level up role. Error:\n```" + err + "```")
                        })
                    }
                }
    
                let endString = ""
    
                if (newRoles.length > 0) {
                    endString = ", and were awarded these roles:\n"
    
                    for (let i = 0; i < newRoles.length; i++) {
                        if (i % 2 === 0) {
                            endString = `${endString}**${newRoles[i].name}** at level **${newRoles[i+1]}**\n`
                        }
                    }
                } else {
                    endString = "!"
                }
    
                
                if (xpOptions.xpChannel !== 0) {
                    const c = index.client.channels.cache.get(xpOptions.xpChannel) as djs.TextChannel | undefined
    
                    if (c !== undefined) {
                        index.safeChannelSend(c, `Congratulations, <@${msg.author.id}>! You've leveled up to level **${xpInfo.level}**${endString}`)
                    }
                } else {
                    index.safeSend(msg, `Congratulations, <@${msg.author.id}>! You've leveled up to level **${xpInfo.level}**${endString}`)
                }
            }
    
            guildcat.addData(`${msg.author.id}_xpInfo`, xpInfo)
        }
    }
}

const commandXP = new command.Command({
    name: "xp",
    description: "XP stats!",
    async callback(msg) {
        const guildcat = dhelper.getCategory(<string>msg.guild?.id) // guild is guaranteed to exist since it isn't called if guild doesn't exist
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