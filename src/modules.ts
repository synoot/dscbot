//
// Stores all of the module-related handlers
//

import djs from "discord.js"
import { ModuleMain, TypeCommand } from "./types"
import data from "./data"

// Contains main function, name, etc.

class Module extends data.AbstractDataHolder<TypeCommand> {
    name : string
    description : string
    debugPath !: string
    enabled : boolean = true
    commands : Map<string, TypeCommand> = new Map()
    main : ModuleMain

    constructor(opts : { name : string, description : string, main : ModuleMain, commands? : TypeCommand[] }) {
        super()

        this.name = opts.name
        this.description = opts.description
        this.main = opts.main

        if (opts.commands) {
            for (let x = 0; x < opts.commands.length; x++) {
                this.addCommand(opts.commands[x])
            }
        }
    }

    // AbstractDataHolder

    addData(key : string, value : TypeCommand) { this.commands.set(key, value); return value }
    getData(key : string) { return this.commands.get(key) }
    removeData(key : string) { const v = this.getData(key); this.commands.delete(key); return v }

    // helpers

    addCommand(command : TypeCommand) { this.addData(command.name, command) }
    getCommand(name : string) { return this.getData(name) }
    removeCommand(name : string) { return this.removeData(name) }
}

// Contains helper functions & modules

class ModuleBase extends data.AbstractDataHolder<Module> {
    modules : Map<string, Module> = new Map()
    reader = new data.DirectoryReader()

    addData(key : string, value : Module) { this.modules.set(key, value); return value }
    getData(key : string) { return this.modules.get(key) }
    removeData(key : string) { const v = this.getData(key); this.modules.delete(key); return v }

    addModule(module : Module) { return this.addData(module.name, module) }
    getModule(name : string) { return this.getData(name) }
    removeModule(name : string) { return this.removeData(name) }

    wipe() { this.modules = new Map() }

    async loadModules() {
        this.wipe()

        const val = await this.reader.requireDirectory("./build/modules", 0);
        for (const n in val) { //a NodeRequire, .module *should* contain a Module
            const v = val[n]
            const p = `./modules/${n}`

            if (v?.module instanceof Module) {
                this.addModule(v.module)
                v.module.debugPath = p
            } else {
                console.warn(`Found non-module in ./modules (path: ${p})\nMake sure exports.module is a Module class!`)
            }
        }
        return await (new Promise((res, _) => {
            res();
        }) as Promise<void>);
    }

    // gets every command from every enabled module

    getCommandList() {
        let c : Map<string, TypeCommand> = new Map()

        this.modules.forEach((m) => { if (m.enabled) { m.commands.forEach((cm) => { c.set(cm.name, cm) }) } })

        return c
    }

    // calls every loaded enabled module's main function

    callMain(msg : djs.Message, client : djs.Client) {
        this.modules.forEach((m) => { if (m.enabled) m.main(msg, client) })
    }
}

export default { ModuleBase, Module }