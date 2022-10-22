(async function () {
    const YAML_PARSER = require('yaml')
    const fs = require('fs')

    const file = fs.readFileSync('./config.yml', 'utf8')
    const CONFIG = YAML_PARSER.parse(file)

    const DATABASES = CONFIG?.databases || null

    if (!DATABASES) {
        throw new Error("input_databases_list")
    }

    console.log('-------------- LOADING CONFIG FILE')

    for (const databases of Object.keys(CONFIG.databases)) {

        const configDb = CONFIG.databases[databases];

        const port = configDb.port;

        const user = configDb.user;

        const password = configDb.password;

        const host = configDb.host;

        const tablesAlreadyMigrated = [];

        console.log('\n')
        console.log('-------------- LOADING CONFIG TABLES: ' + databases)
        console.log('\n')

        const schemasFile = fs.readFileSync(`./${configDb.schemasFiles}`, 'utf8')
        const schemasFileYml = YAML_PARSER.parse(schemasFile)

        const tablesDb = schemasFileYml.tables ?? [];

        const tablesDbDelete = schemasFileYml.tables.map(a => Object.entries(a)[0][0]);

        for (const tableToDelete of tablesDbDelete) {

            try {
                const sql = `DROP TABLE IF EXISTS ${tableToDelete}`;
                await require('./drivers/runSql')({
                    sql,
                    user,
                    password,
                    port,
                    host,
                    database: databases,
                    message: `>> TRYING TO DELETE TABLE: ${tableToDelete}`
                })
            } catch (error) {
                tablesDbDelete.unshift()
                tablesDbDelete.push(tableToDelete)
            }
        }

        for (const tableConfig of tablesDb) {
            const tableName = Object.entries(tableConfig)[0][0];

            const fields = Object.entries(tableConfig)[0][1];

            let references = fields?.references || null

            const tableDependsOn = [];

            if (references) {
                let referencesNormalized = []

                for (const reference of references) {
                    const [tableNameReference] = Object.keys(reference)

                    tableDependsOn.push(tableNameReference)

                    const referenceNormalized = reference[tableNameReference].replaceAll(`{table}`, tableNameReference);

                    referencesNormalized.push(referenceNormalized)
                }

                references = referencesNormalized.join(', \n');
            }


            if (configDb.driver === 'mysql2') {
                let runSql = false

                if (references) {
                    const tablesItDependsAlreadyMigrated = tablesAlreadyMigrated.filter(tb => tableDependsOn.includes(tb))

                    if (tableDependsOn.length === tablesItDependsAlreadyMigrated.length) {
                        runSql = true
                    } else {
                        tablesDb.push(tableConfig)
                    }
                } else {
                    runSql = true
                }

                const fieldsToBodyString = fields.fields || fields[tableName].fields;


                const bodyString = Object.keys(fieldsToBodyString).map(function (line) {
                    return `${line} ${fields.fields[line]}`
                }).join(", \n");

                const ddl = `CREATE TABLE ${tableName} (
                            ${bodyString} \n
                            ${references ? `, \n${references}` : ''}
                );`;


                if (runSql) {
                    tablesAlreadyMigrated.push(tableName)

                    await require('./drivers/runSql')({
                        sql: ddl,
                        user,
                        password,
                        port,
                        host,
                        database: databases,
                        message: `>> UPPING TABLE: ${tableName}`
                    })
                }

            }

        }

        console.log('\n')
        console.log('------------MIGRATED DATABASE TABLES------------')
        console.table(tablesAlreadyMigrated)

    }

})()
