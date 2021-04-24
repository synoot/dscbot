// Holds every interface & abstract class used by the code.

import djs from "discord.js"
import { Command } from "./cmdHandler"

// Generic/Uncategorized Types //

// Data Types //

// Command Types //

export type CommandCallback = ( msg : djs.Message ) => Promise<CommandResponse>

export type CommandResponse = {
    isReply : boolean
    message : string
    embed? : djs.MessageEmbedOptions
}

export type CommandOptions = {
    name : string
    description : string
    callback : CommandCallback
}

// Object Types //

export type BotOptions = {
    token : string
    prefix : string
    data? : object
    filePath? : string
}

export type CategoryOptions = {
    name : string
    commands? : Command[]
}

export type BasicObject<T> = {
    [ index : string ] : T
}