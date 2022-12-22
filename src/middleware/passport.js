const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const config = require('config')

const Sqlite = require('../db/sqlite')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get('JWT')
}

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const db = Sqlite.connect()
        const user = await db.find('users', ['id', 'email'], [`WHERE id="${payload.id}"`])
        db.disconnect()
        if (user) {
          done(null, user[0])
        } else {
          done(null, false)
        }
      } catch (error) {
        console.log(error.message)
      }
    })
  )
}