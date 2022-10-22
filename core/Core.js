import YAML_PARSER from "yaml"
import * as fs from 'fs'
import { fileURLToPath } from 'url';
import path from "path"
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export default class Core {

    CONFIG = null

    constructor({ configFile }) {
        Core.Log('-------------- LOADING CONFIG FILE')
        this.CONFIG = YAML_PARSER.parse(fs.readFileSync(`${__dirname}/../${configFile}`, 'utf8'))
    }

    Check() {
        Core.Log('>> CHECKING ERRORS')

        const DATABASES = this.CONFIG?.databases || null

        if (!DATABASES) {
            throw new Error("input_databases_list")
        }

        Core.Log('>> NO ERRORS')
    }

    Run() {
        this.Check()

        for (const databases of Object.keys(this.CONFIG.databases)) {

            const configDb = this.CONFIG.databases[databases];
    
            const port = configDb.port;
    
            const user = configDb.user;
    
            const password = configDb.password;
    
            const host = configDb.host;

            console.log(databases)
        }

    }

    GetConfig() {

    }

    UpDatabases() {

    }

    RunSql() {

    }


    static Log(message) {
        console.log(message)
    }
}