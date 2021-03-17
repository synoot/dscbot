//
// Holds every abstract type & interface used in the code.
//

import { Client, Message } from "discord.js"

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

export interface TypeCommandHandler {
    commands : Map<string, TypeCommand>
    commandBase : TypeCommandBase

    loadFromDirectory(path : string) : Promise<void>
    getCommand(key : string) : TypeCommand | undefined
}

// CommandCategory types //

export interface TypeCommandCategory {
    name : string
    commands : Map<string, TypeCommand>

    addCommand(command : TypeCommand) : void
}

export interface TypeCommandBase {
    categories : Map<string, TypeCommandCategory>

    addCategory(category : TypeCommandCategory) : void
    getCategory(key : string) : TypeCommandCategory | undefined
    wipe() : void
}

// Module types //

export type ModuleMain = { (msg : Message , client : Client) : Promise<void> }

// Data types //

export interface TypeDataHolder<T> {
    data : Map<string, T>

    addData(key : string, value : T) : T
    getData(key : string) : T | undefined
    removeData(key : string) : T | undefined
}

export interface TypeDataCategory {
    name : string
    data : Map<string, StorageType>

    addData(key : string, value : StorageType) : StorageType
    removeData(key : string) : void
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
    readFileJSON(path : string) : Promise<TypeObject<any>>
    saveFileJSON(path : string, data : TypeObject<any>) : Promise<boolean> // For running code after it has saved
}