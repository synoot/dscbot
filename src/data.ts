import fs from "fs/promises"
import path from "path"
import { BasicObject } from "./types";

export class AbstractMapData<T> {
    private data : Map<string, T> = new Map()

    /**
     * Adds data to `this.data`. Returns `value`.
     * @param key - the key to store the data under, used in retrieval.
     * @param value - the value to store, retrieved using the key provided.
     */
    addData(key : string, value : T) : T { this.data.set(key, value) ; return value }

    /**
     * Retrieves data from `this.data`. Returns the data from said key or undefined.
     * @param key - the key to retrieve data from. Typically used in conjunction with `.addData()`
     */
    getData(key : string) : T | undefined { return this.data.get(key) }

    /**
     * Permanently deletes data from a key. Returns the data under that key or undefined.
     * @param key - the key to delete data from. Typically used in conjunction with `.addData()`
     */
    removeData(key : string) : T | undefined { const d = this.data.get(key) ; this.data.delete(key) ; return d }
}

export class JSONReader {

    /**
     * Reads a JSON file from the filesystem and returns an object.
     * @param path - the path in the filesystem to read from
     */
    async readFromPath(filePath : string) {
        return fs.access(filePath).then(() => {

            return new Promise<BasicObject<any> | string>(async (res, rej) => {
                if (path.extname(filePath) !== ".json") { rej("Passed file is not a JSON file.") }

                const buffer = await fs.readFile(filePath)
                
                res(JSON.parse(buffer.toString()))
            })

        }).catch((err) => console.error(err))
    }
}