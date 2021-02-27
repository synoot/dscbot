// boilerplate for getting data using datahandler.ts

import { Base, Category } from "./datahandler";
import { TypeObject } from "./types";

export class DataHelper {
    base : Base;

    constructor(base : Base) { this.base = base }

    getCategory(name : string) {
        if (this.base.getCategoryExists(name) === true) {
            return this.base.getCategory(name)
        } else {
            const cat = new Category(name)
            this.base.addCategory(cat)
            return cat
        }
    }

    getDataObject(key : string, fallback : TypeObject<any> | any[], category : Category) { //bruh. [] and {} are valid JSON
        if (category.getData(key) !== undefined && typeof category.getData(key) === "object") {
            return <TypeObject<any> | any[]>category.getData(key)
        } else {
            category.addData(key, fallback)
            return fallback
        }
    }

    getDataString(key : string, fallback : string, category : Category) {
        if (category.getData(key) !== undefined) {
            return category.getData(key)
        } else {
            category.addData(key, fallback)
            return fallback
        }
    }

    getDataInt(key : string, fallback : number, category : Category) {
        if (category.getDataInt(key) !== undefined && !isNaN(category.getDataInt(key))) {
            return category.getDataInt(key)
        } else {
            category.addData(key, fallback.toString())
            return fallback
        }
    }

    getDataBool(key : string, fallback : boolean, category : Category) {
        if (category.getData(key) !== undefined) {
            return category.getDataBool(key)
        } else {
            category.addData(key, String(fallback))
            return fallback
        }
    }
}