import { Message } from "discord.js";
import { Command } from "../commandhandler";
import { FileHelper } from "../filehelper";
import Twitter from "twitter";
import { CommandResponse, TypeObject } from "../types";
import { getPrefix } from "..";

const helper = new FileHelper()
const config = helper.readFile("./save/twitter-config.json")

const twitter = new Twitter({
    consumer_key: config.api_key,
    consumer_secret: config.secret_key,
    bearer_token: config.bearer
})

exports.command = new Command({
    name: "tweet",
    description: "Fetches the latest tweet from a given Twitter user",
    category: "Twitter",
    async callback(msg : Message) {
        const username = (msg.content.substr((this.prefix || getPrefix()).length + this.name.length + 1)).toLowerCase()

        let prom : Promise<CommandResponse> = twitter.get("statuses/user_timeline", {screen_name: username, count: 1}).then((tweets : Twitter.ResponseData) => {
            const tweet = tweets[0]
            
            let embed : TypeObject<any> = {
                color: 0x1D9BF0,
                title: "Tweet Link",
                url: `https://www.twitter.com/${username}/status/${tweet.id_str}`,
                author: {
                    name: username,
                    url: `https://www.twitter.com/${username}`,
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
                    reject({
                        isReply: false,
                        message: "Error."
                    })
                }
            })

            return promise as Promise<CommandResponse>
        }).catch((err) => {
            console.error(err)
            
            const promise = new Promise(function(resolve) {
                resolve({
                    isReply: false,
                    message: "Couldn't get any Tweets. Common reasons include private accounts, suspended accounts, or the account itself does not exist."
                })
            })

            return promise as Promise<CommandResponse>
        })

        return prom
    }
})