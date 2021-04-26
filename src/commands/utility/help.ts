import { EmbedField } from "discord.js";
import { Command } from "../../cmdHandler"
import index from "../../index"

const commandsPerPage = 6
const commandDescriptionLength = 100

const truncate = (string : string, length : number) => { return string.length > length ? ( string.substr(0, length - 3) + "..." ) : string }
const mod = (num : number, mod : number) => { return num < mod ? 1 : Math.floor(num / mod) }

exports.command = new Command({
    name: "help",
    description: "This command, you dingus",
    callback: async (msg, startingIndex) => {
        const holder = index.getBot().commandHolder
        const spl = msg.content.split(" ")
        let arg1 : string = spl[startingIndex + 1]

        arg1 = typeof arg1 === "string" ? arg1.toLowerCase() : arg1

        let cat = holder.getData(arg1)

        // this means arg1 was a category
        if (cat !== undefined) {
            let page = Number(spl[startingIndex + 2])
            if (isNaN(page)) { page = 1 }

            const commands = cat.data.size
            const pages = mod(commands, commandsPerPage)
            const commandMax = pages * commandsPerPage - 1
            const commandMin = commandMax - commandsPerPage

            page = page > pages ? pages : page

            let commandFields : EmbedField[] = []

            let index = 0
            cat.data.forEach((cmd, k) => {
                if (index >= commandMin && index <= commandMax) {
                    commandFields.push({
                        name: `${cmd.name}`,
                        value: `${truncate(cmd.description, commandDescriptionLength)}`,
                        inline: true
                    })
                }
                index++
            })

            return {
                isReply: false,
                message: "",
                embed: {
                    title: cat.name,
                    description: `contains \`${commands}\` commands`,
                    author: {
                        name: msg.author.username,
                        icon_url: msg.author.displayAvatarURL()
                    },
                    footer: {
                        text: `Page ${page} / ${pages}`
                    },
                    fields: commandFields
                }
            }
        } else if (arg1 === "categories") {
            let page = Number(spl[startingIndex + 2])
            if (isNaN(page)) { page = 1 }

            const cats = holder.data.size
            const pages = mod(cats, commandsPerPage)
            const catMax = pages * commandsPerPage - 1
            const catMin = catMax - commandsPerPage

            page = page > pages ? pages : page

            let fields : EmbedField[] = []

            let index = 0
            holder.data.forEach((cat, k) => {
                if (index >= catMin && index <= catMax) {
                    fields.push({
                        name: `${cat.name}`,
                        value: `contains \`${cat.data.size}\` commands`,
                        inline: true
                    })
                } 
            })

            return {
                isReply: true,
                message: "",
                embed: {
                    title: "Categories",
                    description: `there are \`${cats}\` categories available`,
                    author: {
                        name: msg.author.username,
                        icon_url: msg.author.displayAvatarURL()
                    },
                    footer: {
                        text: `Page ${page} / ${pages}`
                    },
                    fields: fields
                }
            }
        } else {
            return {
                isReply: false,
                message: "",
                embed: {
                    title: "James Bot",
                    description: "Hello! I am James Bot. I (am planned to) provide a multitude of features from moderation to fun games for the server.",
                    fields: [
                        {
                            name: "Want to contribute?",
                            // replace [repository](xxx) with [repository](your://repository.link)
                            value: "If you want to contribute, or just look at the source code, you can check out the [repository](https://www.github.com/synoot/dscbot)!",
                            inline: true
                        },
                        {
                            name: "Want to support the bot?",
                            value: "There is no 'donation' link and I will not beg you to buy a premium subscription to use any commands in this bot. **Every command and feature will stay free forever.** Just using the bot and sharing it with your friends is enough!",
                            inline: true
                        },
                        {
                            name: "Want to invite the bot?",
                            value: "Currently, there is no invite link for the bot. It is in private testing. If you see this bot and enjoy playing around with it, please consider viewing the repository to suggest new features and report bugs!",
                            inline: true
                        },
                        {
                            name: "Need more help?",
                            value: "Use `help categories` to find categorized commands, and then `help <category>` or `help <category> <page>` to view the commands for that category."
                        }
                    ]
                }
            }
        }
    }
})