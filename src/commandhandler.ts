import { Message } from "discord.js";
import { getPrefix } from "./index.js";
import { CommandOptions, CommandResponse, TypeCommand } from "./types";

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
    callback: (msg: Message) => CommandResponse;
}