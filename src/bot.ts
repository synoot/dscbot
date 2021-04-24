import djs from "discord.js"
import { TypeBotOptions } from "./types"
import { AbstractMapData, JSONReader } from "./data"

class Bot extends AbstractMapData<object> {
    token : string
    prefix : string 
    client : djs.Client

    savePath : string | undefined

    // shardingLimit : number // the upper limit for sharding to begin
    // guildsPerShard : number // the amount guilds per shard - ex. 200 guilds, at 20 guilds/shard would spawn 10 shards

    constructor(botOptions : TypeBotOptions) {
        super()
        
        this.token = botOptions.token
        this.prefix = botOptions.prefix
        this.client = new djs.Client({
            disableMentions: "everyone"
        })

        this.savePath = botOptions.filePath

        this.client.login(this.token).catch((err) => console.error(err))
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
        this.client.login(this.token)
    }
}

export default { Bot }