const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')

const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(passport.initialize())

require('./db/tabels')()
require('./middleware/passport')(passport)
app.use('/api', require('./routes'))

app.get('*', function(req, res){
  res.status(404).json({
    message: 'Not Found'
  })
})

const PORT = process.env.PORT || 1000
app.listen(PORT, () => console.log('Server start:', PORT))