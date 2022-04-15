import * as mysql from 'mysql'
import { ReadWriteDb } from '../types'

const debug = require('debug')('syncdb:mysql')

const FIND_IN_BATCHES_LIMIT = 500

interface TableInfo {
  createTable: string
}

export const mysqlProtocol = 'mysql://'

export function mysqlDatabase(url: string): ReadWriteDb<TableInfo, any> {
  const client = mysql.createConnection(url)

  const exec = async (options: string | mysql.QueryOptions, values?: any[]) => {
    debug(`QUERY: ${options}`)

    return new Promise<[any[], mysql.FieldInfo[]]>((resolve, reject) => {
      client.query(options, values || [], (error, columns, fields) => {
        if (error) {
          reject(error)
        } else {
          resolve([columns, fields || []])
        }
      })
    })
  }

  const findInBatches =
    (tableName: string, hasId: boolean) =>
    (query: string = '') => ({
      async *[Symbol.asyncIterator]() {
        let lastId = 0
        let done = false

        while (!done) {
          const idQuery = hasId ? `id > ${lastId}` : '1'

          const [rows] = await exec(
            `SELECT * FROM ${tableName} WHERE (${query || '1'}) AND ${idQuery}
            LIMIT ${FIND_IN_BATCHES_LIMIT}`
          )

          if (rows.length) {
            lastId = rows[rows.length - 1].id

            yield {
              startId: rows[0].id || 'all',
              endId: rows[rows.length - 1].id || 'all',
              items: rows.map((row: any) => ({ ...row }))
            }
          }

          if (!rows.length || !hasId) {
            done = true
          }
        }
      }
    })

  const replaceItems =
    (tableName: string, columnNames: string[]) =>
    async ({ startId, endId, items }: { startId: any; endId: any; items: any[] }) => {
      const columns = columnNames.map((columnName) => `\`${columnName}\``).join(',')
      const placeholders = items
        .map(
          (row) =>
            `(${Object.values(row)
              .map(() => '?')
              .join(',')})`
        )
        .join(',')
      const values = items.reduce((values, row) => values.concat(Object.values(row)), [])
      const duplicateUpdates = columnNames
        .filter((columnName) => columnName !== 'id')
        .map((columnName) => `\`${columnName}\` = VALUES(\`${columnName}\`)`)
        .join(',')

      try {
        if (columnNames.includes('id')) {
          await exec(`DELETE FROM ${tableName} WHERE id >= ? AND id <= ? AND id NOT IN (?)`, [
            startId,
            endId,
            items.map((item) => item.id)
          ])
        } else {
          await exec(`DELETE FROM ${tableName}`)
        }

        await exec(
          `INSERT INTO ${tableName} (${columns}) VALUES ${placeholders}
          ON DUPLICATE KEY UPDATE ${duplicateUpdates}`,
          values
        )
      } catch (e) {
        console.log('ERROR:', e)
        throw e
      }
    }

  const getForeignKeyConstraints = async () => {
    const [[{ 'DATABASE()': db }]] = await exec('SELECT DATABASE()')

    const [constraints] = await exec(
      `SELECT
      CONSTRAINT_NAME,TABLE_NAME,REFERENCED_TABLE_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = ?`,
      [db]
    )

    return constraints.map((constraint) => ({
      constraintName: constraint.CONSTRAINT_NAME,
      tableName: constraint.TABLE_NAME,
      referencedTableName: constraint.REFERENCED_TABLE_NAME
    }))
  }

  const orderTablesByDependencies = async (tableNames: string[]) => {
    const constraints = await getForeignKeyConstraints()

    const dependencies = tableNames.reduce(
      (deps, name) => ({ ...deps, [name]: [] }),
      {} as { [tableName: string]: string[] }
    )

    constraints.forEach((constraint) => {
      if (tableNames.includes(constraint.referencedTableName)) {
        dependencies[constraint.tableName].push(constraint.referencedTableName)
      }
    })

    const orderedTables: string[] = []

    while (orderedTables.length !== tableNames.length) {
      const oldCount = orderedTables.length

      Object.entries(dependencies).forEach(([tableName, dependencies]) => {
        if (orderedTables.includes(tableName)) return

        if (
          !dependencies.length ||
          dependencies.every((dependency) => orderedTables.includes(dependency))
        ) {
          orderedTables.push(tableName)
        }
      })

      if (orderedTables.length === oldCount) {
        const remainingTables = tableNames
          .filter((name) => !orderedTables.includes(name))
          .map((name) => `${name} depends on ${dependencies[name]?.join('+')}`)

        throw new Error(
          `Circular dependency detected: Couldn't resolve dependencies: ${remainingTables.join(
            ', '
          )}`
        )
      }
    }

    return orderedTables
  }

  return {
    describe() {
      return url
    },

    async connect() {
      client.connect()
      await exec('SET FOREIGN_KEY_CHECKS = 0')
    },

    async close() {
      await exec('SET FOREIGN_KEY_CHECKS = 1')
      client.end()
    },

    async getCollections() {
      const [rows] = await exec('SHOW TABLES')
      const tableNames = await orderTablesByDependencies(
        rows.map((row) => Object.values(row)[0] as string)
      )

      return await Promise.all(
        tableNames.map(async (name) => {
          const [rows] = await exec(`DESCRIBE ${name}`)
          const [[{ 'Create Table': createTable }]] = await exec(`SHOW CREATE TABLE ${name}`)

          const columnNames = rows.map((row) => row.Field)

          return {
            name,
            type: { createTable },
            findInBatches: findInBatches(name, columnNames.includes('id')),
            replaceItems: replaceItems(name, columnNames)
          }
        })
      )
    },

    async deleteCollection(name) {
      await exec(`DROP TABLE ${name}`)
    },

    async upsertCollection(name, { createTable }) {
      const [rows] = await exec('SHOW TABLES')
      const tableNames = rows.map((row) => Object.values(row)[0] as any)

      if (tableNames.includes(name)) {
        const [[{ 'Create Table': currentCreateTable }]] = await exec(`SHOW CREATE TABLE ${name}`)

        if (createTable !== currentCreateTable) {
          await exec(`DROP TABLE ${name}`)
          await exec(createTable)
        }
      } else {
        await exec(createTable)
      }
    }
  }
}
