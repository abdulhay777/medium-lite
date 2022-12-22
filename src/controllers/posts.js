const utils = require('utils')._
const config = require('config')
const Sqlite = require('../db/sqlite')

utils.readTime = (text) => {
  let textLength = text.split(" ").length
  if(textLength > 0){
    let value = Math.ceil(textLength / 200)
    return `${value} min read`
  }
}

module.exports = {
  getPosts: async (req, res) => {

    const user_id = req.params.user_id
    const pagination = req.params.pagination ? (req.params.pagination - 1) * config.get('MIN_VALUES') : 0
    
    try {

      const db = Sqlite.connect()
      const posts = await db.find('posts', [], [`WHERE author="${user_id}"`, `LIMIT ${config.get('MIN_VALUES')}`, `OFFSET ${pagination}`])
      db.disconnect()

      posts.forEach((post) => {
        post.readTimeContent = utils.readTime(post.content)
        post.rating = JSON.parse(post.rating)
      })
      
      res.status(200).json(posts)

    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }

  },
  getPost: async (req, res) => {

    const post_id = req.params.post_id
    const user_id = req.params.user_id
    
    try {

      const db = Sqlite.connect()
      const post = await db.find('posts', [], [`WHERE id="${post_id}" AND author="${user_id}"`])
      db.disconnect()

      if (utils.isEmpty(post)) {
        return res.status(404).json({
          message: 'Not Found'
        })
      }

      post[0].rating = JSON.parse(post[0].rating)
      post[0].readTimeContent = utils.readTime(post[0].content)
      
      res.status(200).json(post[0])

    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }

  },
  addPost: (req, res) => {

    const title = req.body.title
    const content = req.body.content
    const user_id = req.user.id

    try {

      if (utils.isEmpty(title)) {
        return res.status(404).json({
          message: 'Title field empty'
        })
      }

      if (utils.isEmpty(content)) {
        return res.status(404).json({
          message: 'Content field empty'
        })
      }

      const db = Sqlite.connect()
      db.insert('posts', {
        title: title,
        content, content,
        rating: '[]',
        author: user_id
      })
      db.disconnect()

      res.status(200).json({
        message: 'Post create'
      })
      
    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }

  },
  ratingPost: async (req, res) => {

    const user_id = req.user.id
    const post_id = req.body.post_id
    const rating = req.body.rating

    try {

      if (utils.isEmpty(post_id)) {
        return res.status(400).json({
          message: 'Field post_id empty'
        })
      }

      if (rating > 5) {
        return res.status(400).json({
          message: 'Rating max 5'
        })
      }

      const db = Sqlite.connect()
      const post = await db.find('posts', ['id', 'rating'], [`WHERE id="${post_id}"`])

      if (utils.isEmpty(post)) {
        db.disconnect()
        return res.status(400).json({
          message: 'No such post'
        })
      }

      let ratingArray = JSON.parse(post[0].rating)

      if (ratingArray.some(e => e.user_id == user_id)) {
        ratingArray = ratingArray.map(e => {
          if (e.user_id == user_id) {
            e.rating = rating
          }
          return e
        })
      } else {
        ratingArray.push({
          user_id: user_id,
          rating: rating
        })
      }

      db.update('posts', [`rating='${JSON.stringify(ratingArray)}'`, `WHERE id="${post_id}"`])
      db.disconnect()

      res.status(200).json({
        message: 'Success update'
      })
      
    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }

  }
}