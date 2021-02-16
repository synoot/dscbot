import { Message } from "discord.js";
import { getPrefix } from "./index.js";
import { CommandOptions, CommandResponse, TypeCommand } from "./types";

export class Command implements TypeCommand {
    constructor(options : CommandOptions) {
        if (options.prefix !== undefined) {
            this.prefix = options.prefix
        }

        if (options.category !== undefined) {
            this.category = options.category
        }
            
        this.name = options.name
        this.description = options.description
        this.callback = options.callback
    }
    
    prefix: string = getPrefix();
    name: string;
    description: string;
    category: string = "Ungrouped";
    callback: (msg: Message) => CommandResponse;
}