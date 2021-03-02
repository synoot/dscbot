//
// Contains DataBase, DataCategory, DataHelper classes
//

import { StorageType, TypeDataBase, TypeDataCategory, TypeDataHelper, TypeObject } from "./types";

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

    // do later

    writeToFile() {}
    loadFromFile() {}
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
    // ex getData("doesnt_exist", 1, category) -> category.addData("doesnt_exist", 1), return 1
    getData(key : string, fallback : StorageType, category : DataCategory) {
        let d = category.getData(key)
        return d === undefined ? category.addData(key, fallback) : d
    }
}

// expose both classes
export default { DataBase, DataCategory, DataHelper }