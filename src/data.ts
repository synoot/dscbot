//
// Contains DataBase, DataCategory, DataHelper classes
//

import { StorageType, TypeDataBase, TypeDataCategory, TypeDataHelper, TypeFileHelper, TypeObject } from "./types";
import fs from "fs/promises";
import path from "path";
import index from "./index"

//
// DataCategory holds all of the data, stored under a category for organization and to save space when naming keys.
// Internally, DataCategory holds it's data using a Map.
//

class DataCategory implements TypeDataCategory {
    data : Map<string, StorageType> = new Map()
    name : string

    constructor(name : string) { this.name = name }

    addData(key : string, value : string | number | boolean | any[] | TypeObject<any>) { this.data.set(key, value); return value }

    getData(key : string) { return this.data.get(key) }
    
    getDataInt(key : string) {
        const data = this.data.get(key)
        
        if (typeof data !== "number") {
            return undefined
        } else {
            return Number(data)
        }
    }

    getDataBool(key : string) {
        const data = this.data.get(key)

        if (typeof data !== "boolean") {
            return undefined
        } else {
            return data
        }
    }
}

//
// DataBase holds all of the categories for data, and is also used to save it's contents to files, and load from files as well. Internal structure loosely resembles JSON.
// Internally, DataBase holds all of it's data using a Map.
//

class DataBase implements TypeDataBase {
    // holds all of this Base's categories
    categories : Map<string, DataCategory> = new Map()

    addCategory(value : DataCategory) { this.categories.set(value.name, value); return value }
    getCategory(key : string) { return this.categories.get(key) }
    getCategoryExists(key : string) { return this.categories.get(key) !== undefined }

    async writeToFile(path : string) {
        await fs.access(path).catch((err) => console.warn(err))

        const fh = index.getFHelper()
        
        let s : TypeObject<any> /* save object */ = {}

        this.categories.forEach((cat) => {
            const sc : TypeObject<any> /* save object (category) */ = {}
            
            cat.data.forEach((dat, key) => {
                sc[key] = dat
            })
            
            s[cat.name] = sc
        })

        return fh.saveFileJSON(path, s).then(() => {
            return new Promise((res) => { res() }) as Promise<void>
        })
    }

    async loadFromFile(path : string) {
        await fs.access(path).catch((err) => console.warn(err)) //validate path

        const fh = index.getFHelper()
        const j = await fh.readFileJSON(path)

        console.log(`Loaded JSON ${j} from path ${path}`)

        for (const catn in j) {
            const cat = new DataCategory(catn)
            this.addCategory(cat)

            for (const valn in j[catn]) {
                cat.addData(valn, j[catn][valn])
            }
        }

        return new Promise((res) => { res() }) as Promise<void>;
    }
}

class DataHelper implements TypeDataHelper {
    base : TypeDataBase

    constructor(base : TypeDataBase) { this.base = base }

    // Gets category, and creates a new one if it doesn't exist
    getCategory(key : string) { 
        let c = this.base.getCategory(key)
        return c === undefined ? this.base.addCategory(new DataCategory(key)) : c
    }

    // Gets data in the specified category, and makes a new entry with the fallback value if it doesn't exist
    // ex getData("doesnt_exist", 1, category) -> category.addData("doesnt_exist", 1) -> return 1
    getData(key : string, fallback : StorageType, category : DataCategory) {
        let d = category.getData(key)
        return d === undefined ? category.addData(key, fallback) : d
    }
}

class FileHelper implements TypeFileHelper {
    async readFileJSON(path : string) {
        return fs.access(path).then(async () => { //if the path exists

            try {
                const buff = await fs.readFile(path);
                const j = JSON.parse(buff.toString());
                return await (new Promise((res, rej) => {
                    if (Object.keys(j).length >= 1) {
                        res(j);
                    } else {
                        rej("Invalid JSON object.");
                    }
                }) as Promise<TypeObject<any>>);
            } catch (err) {
                throw err;
            }

        }).catch((err) => { throw err })
    }

    async saveFileJSON(path : string, data : TypeObject<any>) {
        return fs.access(path).then(async () => { //if the path exists

            try {
                await fs.writeFile(path, JSON.stringify(data));
                return await (new Promise((res) => {
                    res(true);
                }) as Promise<boolean>);
            } catch (err) {
                throw err;
            }

        }).catch((err) => { throw err })
    }
}

class DirectoryReader {
    async requireDirectory(folder : string, depth : number, current : number = 0) {
        try {
            await fs.access(folder);
            const arr = await fs.readdir(folder, { withFileTypes: true });
            let entries: TypeObject<any> = {};
            for (let x = 0; x < arr.length; x++) {
                const dt = arr[x];
                const absPath = path.resolve(folder, dt.name);

                console.log(folder, absPath)

                if (dt.isFile() && path.extname(dt.name) === ".js") {
                    const cmd = require(absPath);

                    delete require.cache[absPath]; //clears cache to allow re-requiring

                    entries[dt.name.split(".")[0]] = cmd; //ex ./commands/file.ts
                } else if (dt.isDirectory() && current + 1 <= depth) {
                    await this.requireDirectory(absPath, depth, current + 1).then((val) => { //"recursively" scans directories
                        entries[dt.name] = val
                    })
                }
            }
            return await (new Promise((res, rej) => {
                res(entries);
            }) as Promise<TypeObject<any>>);
        } catch (err) {
            throw err;
        }
    }
}

// expose both classes
export default { DataBase, DataCategory, DataHelper, FileHelper, DirectoryReader }