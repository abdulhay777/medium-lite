const sql = require('./sqlite')

module.exports = function () {
  const db = sql.connect()

  db.createTable('users', {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    email: 'TEXT',
    password: 'TEXT'
  })

  db.createTable('posts', {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    title: 'TEXT',
    content: 'TEXT',
    author: 'INTEGER',
    rating: 'TEXT'
  })

  db.disconnect()
}