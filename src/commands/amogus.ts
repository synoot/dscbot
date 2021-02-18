import { Message } from "discord.js";
import { Command } from "../commandhandler";
import { FileHelper } from "../filehelper";
import Twitter from "twitter";
import { TypeObject } from "../types";

const sleep = require("system-sleep")

const helper = new FileHelper()
const config = helper.readFile("./save/amogus-config.json")

const twitter = new Twitter({
    consumer_key: config.api_key,
    consumer_secret: config.secret_key,
    bearer_token: config.bearer
})

exports.command = new Command({
    name: "amogus",
    description: "Fetches the latest tweet from @sustoss on Twitter",
    category: "Amogus :)",
    callback(msg : Message) {
        let ret : TypeObject<any> = {
            title: "Error?",
            description: "Error!"
        }

        let oldRet = JSON.parse(JSON.stringify(ret))

        twitter.get("statuses/user_timeline", {screen_name: config.userid, count: 10}, (err, tweets, res) => {
            if (err) { throw err }

            
            const tweet = tweets[5]
            let text : string = tweet.text
            
            let embed : TypeObject<any> = {
                color: 0x1D9BF0,
                title: "Tweet Link",
                url: `https://www.twitter.com/sustoss/status/${tweet.id_str}`,
                author: {
                    name: "sustoss",
                    url: "https://www.twitter.com/sustoss",
                    icon_url: tweet.user.profile_image_url_https
                },
                timestamp: new Date(tweet.created_at),
                footer: {
                    text: "Amogus",
                    icon_url: "https://cdn.discordapp.com/attachments/777798028475629590/811810046282301450/amoguszoom.png"
                },
                description: tweet.text
            }

            if (tweet.entities.media.length > 0) {
                embed.thumbnail = {url: tweet.entities.media[0].media_url}
            }

            ret = embed
        })

        sleep(500)

        console.log(ret)

        return {
            isReply: false,
            message: "",
            embed: ret
        }
    }
})