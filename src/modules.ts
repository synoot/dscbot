//
// Stores all of the module-related handlers
//

import djs from "discord.js"
import { ModuleLoop, ModuleMain, TypeCommand } from "./types"
import data from "./data"

// Contains main function, name, etc.

class Module extends data.AbstractDataHolder<TypeCommand> {
    private isEnabled : boolean = true
    name : string
    description : string
    debugPath !: string
    canDisable : boolean
    commands : Map<string, TypeCommand> = new Map()
    main : ModuleMain
    moduleLoop : ModuleLoop | undefined

    constructor(opts : { name : string, description : string, main : ModuleMain, commands? : TypeCommand[], disableable? : boolean, loop? : ModuleLoop }) {
        super()

        this.name = opts.name
        this.description = opts.description
        this.main = opts.main
        this.canDisable = opts.disableable !== undefined ? opts.disableable : true
        this.moduleLoop = opts.loop

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

    public get enabled() {
        return this.canDisable === true ? this.isEnabled : true
    }

    public set enabled(e : boolean) {
        this.isEnabled = this.canDisable === true ? e : true
    }
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

    getModuleEnabled(name : string) { const mod = this.getModule(name) ; if (mod) { return mod.enabled } else { throw `[modules] invalid module name passed (name: ${name})` } }

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

    // gets every registered loop from every enabled module

    getLoops() {
        let c : ModuleLoop[] = []

        this.modules.forEach((m) => { if (m.enabled && m.moduleLoop !== undefined) { c.push(m.moduleLoop) } })

        return c
    }

    // calls every loaded enabled module's main function

    callMain(msg : djs.Message, client : djs.Client) {
        this.modules.forEach((m) => { if (m.enabled) m.main(msg, client) })
    }
}

export default { ModuleBase, Module }