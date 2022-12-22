const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const utils = require('utils')._

const Sqlite = require('../db/sqlite')

utils.checkEmail = (email) => {
  let re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  return re.test(String(email).toLowerCase())
}

utils.meanValue = (arr) => {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i].rating
  }
  return sum / arr.length
}

module.exports = {
  getUser: async (req, res) => {

    const user_id = req.params.user_id

    try {
      
      const db = Sqlite.connect()
      const user = await db.find('users', ['id', 'email'], [`WHERE id="${user_id}"`])

      if (utils.isEmpty(user)) {
        db.disconnect()
        return res.status(404).json({
          message: 'Not Found'
        })
      }

      const posts = await db.find('posts', ['rating'], [`WHERE author="${user[0].id}"`])
      const ratingArray = []
      for await (let post of posts) {
        ratingArray.push({
          rating: Math.round(utils.meanValue(JSON.parse(post.rating)))
        })
      }
      user[0].rating = Math.round(utils.meanValue(ratingArray)) || 0
      db.disconnect()

      res.status(200).json(user[0])

    } catch (error) {
      console.log(error)
      res.status(500).json({
        message: error.message
      })
    }

  },
  getUsers: async (req, res) => {

    const pagination = req.params.pagination ? (req.params.pagination - 1) * config.get('MIN_VALUES') : 0

    try {
      
      const db = Sqlite.connect()
      const users = await db.find('users', ['id', 'email'], [`LIMIT ${config.get('MIN_VALUES')}`, `OFFSET ${pagination}`])

      if (utils.isEmpty(users)) {
        db.disconnect()
        return res.status(404).json({
          message: 'Not Found'
        })
      }

      for await (let user of users) {
        const posts = await db.find('posts', ['rating'], [`WHERE author="${user.id}"`])
        const ratingArray = []
        for await (let post of posts) {
          ratingArray.push({
            rating: Math.round(utils.meanValue(JSON.parse(post.rating)))
          })
        }
        user.rating = Math.round(utils.meanValue(ratingArray)) || 0
      }
      
      db.disconnect()

      res.status(200).json(users)

    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }

  },
  login: async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    try {

      if (utils.isEmpty(email)) {
        return res.status(404).json({
          message: 'Email field empty'
        })
      }
  
      if (utils.isEmpty(password)) {
        return res.status(404).json({
          message: 'Password field empty'
        })
      }
  
      if (!utils.checkEmail(email)) {
        return res.status(400).json({
          message: 'Invalid email address'
        })
      }
  
      const db = Sqlite.connect()
      const user = await db.find('users', ['id', 'password'], [`WHERE email="${email}"`])
      db.disconnect()
  
      if (utils.isEmpty(user)) {
        return res.status(404).json({
          message: 'User with this email address was not found'
        })
      }
  
      const check_password = bcryptjs.compareSync(password, user[0].password)
  
      if (!check_password) {
        return res.status(401).json({
          message: 'Password is wrong'
        })
      }
  
      const token = jwt.sign({
        email: email,
        id: user[0].id
      }, config.get('JWT'), {expiresIn: config.get('JWT_TIME')})
      
      res.status(200).json({
        token: `Bearer ${token}`
      })

    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }

  },
  register: async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    try {
      
      if (utils.isEmpty(email)) {
        return res.status(404).json({
          message: 'Email field empty'
        })
      }
  
      if (utils.isEmpty(password)) {
        return res.status(404).json({
          message: 'Password field empty'
        })
      }
  
      if (!utils.checkEmail(email)) {
        return res.status(400).json({
          message: 'Invalid email address'
        })
      }
  
      if (password.length < 5) {
        return res.status(404).json({
          message: 'Password minimum allowed number of characters 5'
        })
      }
  
      const db = Sqlite.connect()
      const has_user = await db.find('users', ['id'], [`WHERE email="${email}"`])
  
      if (!utils.isEmpty(has_user)) {
        db.disconnect()
        return res.status(409).json({
          message: 'This email already exists'
        })
      }
  
      const salt = bcryptjs.genSaltSync(10)
      db.insert('users', {
        email: email,
        password: bcryptjs.hashSync(password, salt)
      })
  
      const user = await db.find('users', ['id'], [`WHERE email="${email}"`])
  
      db.disconnect()
  
      const token = jwt.sign({
        email: email,
        id: user[0].id
      }, config.get('JWT'), {expiresIn: config.get('JWT_TIME')})
      
      res.status(200).json({
        token: `Bearer ${token}`
      })

    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }

  }
}