import fs from "fs"
import { DataBase, DataCategory, TypeObject } from "./types"

export class Category implements DataCategory {
    name : string = ""
    data : TypeObject<string> = {}  //Everything is stored as a string now, and is cast when
                                    //getData<T> is called
    constructor(name : string) {
        this.name = name
    }

    addData(key : string, value : string) {
        this.data[key] = value
    }

    getData(key : string) {
        return this.data[key]
    }

    getDataInt(key : string) {
        return Number(this.data[key])
    }

    getDataBool(key : string) {
        return this.getData(key) !== "false"
    }
}

export class Base implements DataBase {
    categories : TypeObject<Category> = {}

    addCategory(category : Category) {
        this.categories[category.name] = category
    }

    getCategory(categoryName : string) {
        return this.categories[categoryName]
    }

    getCategoryExists(categoryName : string) {
        return this.categories[categoryName] !== undefined
    }

    writeToFile(path : string) {
        fs.access(path, (err) => { if (err) throw err; })

        let s : TypeObject<any> = {}

        for (let c in this.categories) {
            let cat = this.categories[c]

            s[cat.name] = {}

            for (let d in cat.data) {
                let dat = cat.data[d]
                s[cat.name][d] = dat
            }
        }

        fs.writeFile(path, JSON.stringify(s), (err) => { if (err) throw err; })
    }

    loadFromFile(path : string) {
        fs.access(path, (err) => { if (err) throw err; })

        let b : string = fs.readFileSync(path, 'utf-8')
        console.log(`Loaded ${b} from path ${path}`)
        let d : TypeObject<any> = JSON.parse(b)

        for (let c in d) {
            console.log(`Found category ${c}`)
            let cat = new Category(c)

            for (let dt in d[c]) {
                console.log(`Found data ${d[c][dt]} under key ${dt} belonging to ${c}`)
                cat.addData(dt, d[c][dt])
            }

            this.addCategory(cat)
        }
    }
}