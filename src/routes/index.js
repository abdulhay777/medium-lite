const {Router} = require('express')
const passport = require('passport')
const router = Router()

const postsController = require('../controllers/posts')
const usersController = require('../controllers/users')

router.get('/users', usersController.getUsers)
router.get('/users/:pagination', usersController.getUsers)
router.post('/users/login', usersController.login)
router.post('/users/register', usersController.register)

router.get('/user/:user_id', usersController.getUser)
router.get('/user/:user_id/posts', postsController.getPosts)
router.get('/user/:user_id/posts/:pagination', postsController.getPosts)
router.get('/user/:user_id/post/:post_id', postsController.getPost)

router.post('/post/add', passport.authenticate('jwt', {session: false}), postsController.addPost)
router.post('/post/rating', passport.authenticate('jwt', {session: false}), postsController.ratingPost)

module.exports = router