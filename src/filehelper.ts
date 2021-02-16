import fs from "fs";
import { TypeObject, TypeFileHelper } from "./types"

export class FileHelper implements TypeFileHelper {
    readFile(path : string) {
        fs.access(path, (err) => { if (err) throw err; }) //make sure the file can be accessed

        const j : TypeObject<any> = JSON.parse(fs.readFileSync(path).toString())
        return j
    }

    saveFile(path : string, data : TypeObject<any>) {
        fs.access(path, (err) => { if (err) throw err; })

        const s : string = JSON.stringify(data)
        fs.writeFile(path, s, (err) => { if (err) throw err; })
    }
}