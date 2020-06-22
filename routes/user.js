const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');
const passport = require('passport');

const router = express.Router();

router.get('/', (req, res) => {
	if (!req.user) {
		return res.status(401).send('You have to log in.');
	}
	const user = Object.assign({}, req.user.toJSON());
	delete user.password;
	return res.json(user);
});

router.post('/', async (req, res, next) => {
	// POST /api/user sign up
	try {
		const exUser = await db.User.findOne({
			where: {
				userId: req.body.userId
			}
		});
		if (exUser) {
			return res.status(403).send('Already use this id');
		}
		const hashedPassword = await bcrypt.hash(req.body.password, 12); // salt 10 ~ 13
		const newUser = await db.User.create({
			userId: req.body.userId,
			password: hashedPassword
		});
		return res.status(200).json(newUser);
	} catch (error) {
		console.error(error);
		return next(error);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		const user = await db.User.findOne({
			where: { id: parseInt(req.params.id, 10) },
			include: [
				{
					model: db.Post,
					as: 'Posts',
					attributes: [ 'id' ]
				},
				{
					model: db.User,
					as: 'Followings',
					attributes: [ 'id' ]
				},
				{
					model: db.User,
					as: 'Followers',
					attributes: [ 'id' ]
				}
			],
			attributes: [ 'id', 'userId' ]
		});
		const jsonUser = user.toJSON();
		jsonUser.Posts = jsonUser.Posts ? jsonUser.Posts.length : 0;
		jsonUser.Followings = jsonUser.Followings ? jsonUser.Followings.length : 0;
		jsonUser.Followers = jsonUser.Followers ? jsonUser.Followers.length : 0;
		return req.json(jsonUser);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

router.post('/logout', (req, res) => {
	// POST /api/user/logout log out
	req.logOut();
	req.session.destroy();
	res.send('log out success!');
});

router.post('/login', (req, res, next) => {
	// POST /api/user/login log in
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			console.error(err);
			return next(err);
		}
		if (info) {
			return res.status(401).send(info.reason);
		}
		return req.login(user, async (loginErr) => {
			try {
				if (loginErr) {
					return next(loginErr);
				}
				const fullUser = await db.User.findOne({
					where: { id: user.id },
					include: [
						{
							model: db.Post,
							as: 'Posts',
							attributes: [ 'id' ]
						},
						{
							model: db.User,
							as: 'Followings',
							attributes: [ 'id' ]
						},
						{
							model: db.User,
							as: 'Followers',
							attributes: [ 'id' ]
						}
					],
					attributes: [ 'id', 'userId' ]
				});
				console.log(fullUser);
				return res.json(fullUser);
			} catch (error) {
				next(error);
			}
		});
	})(req, res, next);
});

router.get('/:id/follow', (req, res) => {});

router.post('/:id/follow', (req, res) => {});

router.delete('/:id/follow', (req, res) => {});

router.delete('/:id/follower', (req, res) => {});

router.get('/:id/posts', async (req, res, next) => {
	try {
		const posts = await db.Post.findAll({
			where: {
				UserId: parseInt(req.params.id, 10),
				RetweetId: null
			},
			include: [
				{
					model: db.User,
					attributes: [ 'id', 'userId' ]
				}
			]
		});
		res.json(posts);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

module.exports = router;
