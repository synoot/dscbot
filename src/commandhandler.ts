import { Message } from "discord.js";
import { getPrefix } from "./index.js";
import { CommandOptions, CommandResponse, TypeCommand, TypeCommandCategory, TypeCommandHandler, TypeObject } from "./types";

export class Command implements TypeCommand {
    constructor(options : CommandOptions) {
        if (options.prefix !== undefined) {
            this.prefix = options.prefix
        }
            
        this.name = options.name
        this.description = options.description
        this.callback = options.callback
    }
    
    prefix: string = getPrefix();
    name: string;
    description: string;
    category: string = "Ungrouped";
    callback: (msg: Message) => Promise<CommandResponse>;
}

export class CommandCategory implements TypeCommandCategory {
    name : string;
    commands : TypeObject<Command> = {};

    constructor(name : string) { 
        this.name = name 
        console.log(`Created Category ${name}`)
    }
    addCommand(command : Command) { 
        this.commands[command.name] = command
        console.log(`Added command ${command.name} to category ${this.name}`)
    }
}

export class CommandHandler implements TypeCommandHandler {
    categories : TypeObject<CommandCategory> = {
        Uncategorized: new CommandCategory("Uncategorized")
    };

    addCategory(category : CommandCategory) { 
        this.categories[category.name] = category
        console.log(`Added Category ${category.name}`)
    }
    getCategory(name : string) { return this.categories[name] }
    wipe() { 
        this.categories = { Uncategorized: new CommandCategory("Uncategorized") }
        console.log("Wiped.")
    }
}