import djs from "discord.js"
import { BotOptions } from "./types"
import { MapDataHolder, JSONReader } from "./data"
import { CommandHolder } from "./cmdHandler"

export class Bot extends MapDataHolder<object> {
    token : string
    prefix : string 
    commandHolder : CommandHolder
    client : djs.Client

    savePath : string | undefined

    // shardingLimit : number // the upper limit for sharding to begin
    // guildsPerShard : number // the amount guilds per shard - ex. 200 guilds, at 20 guilds/shard would spawn 10 shards

    constructor(botOptions : BotOptions) {
        super()
        
        this.token = botOptions.token
        this.prefix = botOptions.prefix
        this.client = new djs.Client({
            disableMentions: "everyone"
        })

        this.commandHolder = new CommandHolder()

        this.savePath = botOptions.filePath
    }

    loadFromPath() {
        if (this.savePath) {
            //add later
        } else { console.error("[bot.ts] loadFromPath() called while savePath is undefined.") }
    }

    saveToFile() {
        if (this.savePath) {
            //add later
        } else { console.error("[bot.ts] saveToFile() called while savePath is undefined.") }
    }

    login() {
        this.client.login(this.token).catch((err) => console.error(err))
    }
}