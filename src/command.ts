import { CommandCallback, CommandOptions, TypeCommand, TypeCommandBase, TypeCommandCategory, TypeCommandHandler } from "./types";
import index from "./index"

class Command implements TypeCommand {
    prefix = index.getPrefix()
    description : string
    callback : CommandCallback
    name : string

    constructor(options : CommandOptions) {
        this.description = options.description
        this.name = options.name
        this.callback = options.callback
        this.prefix = options.prefix !== undefined ? options.prefix : this.prefix
    }
}

class CommandCategory implements TypeCommandCategory {
    name : string
    commands : Map<string, Command> = new Map()

    constructor(name : string) { this.name = name }

    addCommand(command : Command) { this.commands.set(command.name, command) }
    getCommand(command : string) { return this.commands.get(command) }
}

class CommandBase implements TypeCommandBase {
    categories : Map<string, CommandCategory> = new Map()

    constructor() {
        const uncat = new CommandCategory("uncategorized")
        this.addCategory(uncat)
    }

    addCategory(category : CommandCategory) { this.categories.set(category.name, category) }
    getCategory(key : string) { return this.categories.get(key) }
    wipe() { 
        this.categories = new Map()
        const uncat = new CommandCategory("uncategorized")
        this.addCategory(uncat)
    }
}

class CommandHandler implements TypeCommandHandler {
    commands : Map<string, Command> = new Map()
    commandBase : CommandBase = new CommandBase()
    
    async loadFromDirectory() {
        const reader = index.getReader()

        this.commandBase.wipe()

        const val = await reader.requireDirectory("./build/commands", 1);
        for (const n in val) { //either a category or a NodeRequire
            const v = val[n];

            console.log(v)

            if (v?.command instanceof Command) {
                const cat = this.commandBase.getCategory("uncategorized");
                cat?.addCommand(v.command);
                this.addCommand(v.command)
            } else {
                const cat_1 = new CommandCategory(n);
                this.addCategory(cat_1);

                for (const n2 in val[n]) {
                    const v2 = <Command>val[n][n2].command;

                    cat_1.addCommand(v2);
                    this.addCommand(v2)
                }
            }
        }
        return await (new Promise((res, _) => {
            res();
        }) as Promise<void>);
    }

    getCommand(key : string) { return this.commands.get(key) }
    addCommand(command : Command) { this.commands.set(command.name, command) }

    //expose CommandBase functions

    getCategory(key : string) { return this.commandBase.getCategory(key) }
    addCategory(cat : CommandCategory) { this.commandBase.addCategory(cat) }

    getCategories() { return this.commandBase.categories }
}

export default { Command, CommandCategory, CommandBase, CommandHandler }