// loads commands - exports classes CommandHolder, CommandCategory, Command & SlashCommand

import { DirectoryReader, MapDataHolder } from "./data";
import { BasicObject, CategoryOptions, CommandCallback, CommandOptions } from "./types";

export class Command {
    name : string
    description : string
    callback : CommandCallback

    constructor(opts : CommandOptions) {

        // convoluted line to effectively check if the command name has any spaces in it - which makes it invalid
        if (opts.name.trim().split(" ").length > 1) { throw "[cmdHandler.ts] You cannot have a command name with spaces in it." }

        this.name = opts.name
        this.description = opts.description
        this.callback = opts.callback
    }
}

export class CommandCategory extends MapDataHolder<Command> {
    name : string

    constructor(opts : CategoryOptions) {
        
        if (opts.name.trim().split(" ").length > 1) { throw "[cmdHandler.ts] You cannot have a category name with spaces in it. You may want to check your file structure." }
        
        super()

        this.name = opts.name

        if (opts.commands !== undefined) {
            for (let i = 0; i < opts.commands.length; i++) {
                const cmd = opts.commands[i]
                this.addData(cmd.name, cmd)
            }
        }
    }
}

export class CommandHolder extends MapDataHolder<CommandCategory> {
    reader = new DirectoryReader()
    commandMap : Map<string, Command> = new Map()

    constructor() {
        super()
        
        const uncat = new CommandCategory({name: "uncategorized"})

        this.addData(uncat.name, uncat)
    }

    wipe() {
        this.data = new Map()

        const uncat = new CommandCategory({name: "uncategorized"})

        this.addData(uncat.name, uncat)
    }

    async load() {
        const res : BasicObject<any> = await this.reader.requireDirectory("./build/commands", 1)
        const uncat = this.getData("uncategorized") as CommandCategory

        for (let i in res) {
            const entry = res[i]

            if (entry?.command instanceof Command) {
                uncat.addData(entry.command.name, entry.command)
                this.commandMap.set(entry.command.name, entry.command)
            } else {
                const commandList = []

                for (let j in entry) {
                    const secondEntry = entry[j]

                    if (secondEntry.command instanceof Command) {
                        commandList.push(secondEntry.command)
                        this.commandMap.set(secondEntry.command.name, secondEntry.command)
                    }
                }

                const cat = new CommandCategory({name: i, commands: commandList})
                
                this.addData(cat.name, cat)
            }
        }
    }
}