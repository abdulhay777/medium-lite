const {Database} = require('sqlite3').verbose()
const path = require('path')

class Sqlite {
  constructor() {
    this.db = new Database(path.join(__dirname, 'database.db'))
  }
  disconnect() {
    this.db.close()
  }
  createTable(tableName, fieldObject) {
    let entries = Object.entries(fieldObject)
    let fields = entries.map( ([key, val] = entry) => {
      return `${key} ${val}`
    })
    fields = fields.join(', ')
    this.db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${fields})`)
  }
  dropTable(tableName) {
    this.db.run(`DROP TABLE ${tableName}`)
  }
  insert(tableName, fieldObject) {
    let keys = Object.keys(fieldObject).join(', ')
    let values = Object.values(fieldObject)
    values = values.map(e => `"${e}"`)
    values = values.join(', ')
    this.db.run(`INSERT into ${tableName} (${keys}) values (${values})`)
  }
  find(tableName, fieldArray, queryArray) {
    return new Promise((resolve, reject) => {
      let selectField = fieldArray.length > 0 ? fieldArray.join(', ') : '*'
      let queryField = queryArray.length > 0 ? queryArray.join(' ') : ''
      this.db.all(`SELECT ${selectField} FROM ${tableName} ${queryField}`, (error, data) => {
        if (error) reject(resolve)
        resolve(data)
      })
    })
  }
  update(tableName, queryArray) {
    if (queryArray.length > 0) {
      let queryField = queryArray.join(' ')
      this.db.run(`UPDATE ${tableName} SET ${queryField}`)
    }
  }
}

module.exports = {
  connect: () => {
    return new Sqlite()
  }
}