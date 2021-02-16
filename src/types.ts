import { Message } from "discord.js"

// Basic types //

export interface TypeObject<T> {
    [index : string] : T
}

export type OwOLevel = "none" | "owo" | "uwu" | "uvu"

// Command types //

export interface CommandResponse {
    isReply : boolean
    message : string
    users? : Array<string>
}

export type CommandCallback = { (msg : Message) : CommandResponse }

export interface CommandOptions {
    name : string
    description : string
    callback : CommandCallback
    prefix? : string
}

export interface TypeCommand {
    prefix : string
    name : string
    description : string
    callback : CommandCallback
}

// SaveHandler types //

export interface DataCategory {
    name : string
    data : TypeObject<string | boolean | number>

    addData(key : string, value : string | boolean | number) : void
    getData(key : string) : string | boolean | number

    // These three do type casting (yuck) //

    getDataInt(key : string) : number
    getDataBool(key : string) : boolean
}

export interface DataBase {
    categories : TypeObject<DataCategory>

    addCategory(category : DataCategory) : void
    getCategory(categoryName : string) : DataCategory
    getCategoryExists(categoryName : string) : boolean
    writeToFile(path : string) : void
    loadFromFile(path : string) : void
}

// FileHelper types //

export interface TypeFileHelper {
    readFile(path : string) : TypeObject<any>
    saveFile(path : string, data : TypeObject<any>) : void
}