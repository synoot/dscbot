import { Message } from "discord.js";
import { Command } from "../commandhandler";
import { FileHelper } from "../filehelper";
import Twitter from "twitter";
import { CommandResponse, TypeObject } from "../types";

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
    category: "Amogus",
    async callback(msg : Message) {
        let ret : TypeObject<any> = {
            title: "Error?",
            description: "Error!"
        }

        let prom : Promise<CommandResponse> = twitter.get("statuses/user_timeline", {screen_name: config.userid, count: 1}).then((tweets : Twitter.ResponseData) => {
            const tweet = tweets[0]
            
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
        
            if (tweet.entities.media !== undefined) {
                embed.thumbnail = {url: tweet.entities.media[0].media_url}
            }

            const promise = new Promise(function(resolve, reject) {
                if (tweets[0] !== undefined) {
                    resolve({
                        isReply: false,
                        message: "",
                        embed: embed
                    })
                } else {
                    reject("No tweets?")
                }
            })

            return promise as Promise<CommandResponse>
        }).catch((err) => {
            throw err;
        })

        return prom
    }
})