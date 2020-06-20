const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => {
	passport.serializeUser((user, done) => {
		return done(null, user.id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const user = await db.User.findOne({
				where: { id }
			});
			return done(null, user);
		} catch (error) {
			console.log(error);
			return done(error);
		}
	});

	local();
};

// frontend send only cookie to backend server
// backend server search cookie & can find id as express-session
// That id => deserializeUser
// user information => req.user
// every request => go deserialzeUser
