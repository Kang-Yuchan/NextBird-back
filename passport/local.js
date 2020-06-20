const passport = require('passport');
const { Strategy, LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../models');

module.exports = () => {
	passport.use(
		new LocalStrategy(
			{
				usernameField: 'userId',
				passportField: 'password'
			},
			async (userId, password, done) => {
				try {
					const user = await db.User.findOne({ where: { userId } });
					if (!user) {
						return done(null, false, { reason: 'This is not user' });
					}
					const result = await bcrypt.compare(password, user.password);
					if (result) {
						return done(null, user);
					}
					return done(null, false, { reason: 'This password is wrong' });
				} catch (error) {
					console.log(error);
					return done(error);
				}
			}
		)
	);
};
