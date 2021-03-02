import { Message } from "discord.js"

// Basic types //

export interface TypeObject<T> {
    [index : string] : T
}

export type OwOLevel = "none" | "owo" | "uwu" | "uvu"
export type StorageType = string | number | boolean | any[] | TypeObject<any>

// Command types //

export interface CommandResponse {
    isReply : boolean
    message : string
    embed? : TypeObject<any>
    users? : Array<string>
}

export type CommandCallback = { (msg : Message) : Promise<CommandResponse> }

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

// CommandCategory types //

export interface TypeCommandCategory {
    name : string
    commands : TypeObject<TypeCommand>

    addCommand(command : TypeCommand) : void
}

export interface TypeCommandHandler {
    categories : TypeObject<TypeCommandCategory>

    addCategory(category : TypeCommandCategory) : void
    wipe() : void
    getCategory(key : string) : TypeCommandCategory
}

// SaveHandler types //

export interface TypeDataCategory {
    name : string
    data : Map<string, StorageType>

    addData(key : string, value : StorageType) : StorageType
    getData(key : string) : StorageType | undefined

    getDataInt(key : string) : number | undefined
    getDataBool(key : string) : boolean | undefined
}

export interface TypeDataBase {
    categories : Map<string, TypeDataCategory>

    addCategory(category : TypeDataCategory) : TypeDataCategory
    getCategory(key : string) : TypeDataCategory | undefined
    getCategoryExists(key : string) : boolean
    writeToFile(path : string) : void
    loadFromFile(path : string) : void
}

export interface TypeDataHelper {
    base : TypeDataBase
    
    getCategory(key : string) : TypeDataCategory
    getData(key : string, fallback : StorageType, category : TypeDataCategory) : StorageType
}

// FileHelper types //

export interface TypeFileHelper {
    readFile(path : string) : TypeObject<any>
    saveFile(path : string, data : TypeObject<any>) : void
}