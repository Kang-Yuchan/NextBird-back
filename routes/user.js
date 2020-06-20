const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models');

const router = express.Router();

router.get('/', (req, res) => {});

router.post('/', async (req, res, next) => {
	// POST sign up
	try {
		const exUser = await db.User.findOne({
			where: {
				userId: req.body.userId
			}
		});
		if (exUser) {
			return res.status(403).send('Already use this id');
		}
		const hashedPassword = bcrypt.hash(req.body.password, 12); // salt 10 ~ 12
		const newUser = await db.User.create({
			name: req.body.name,
			password: hashedPassword
		});
		console.log(newUser);
		return res.json(newUser);
	} catch (error) {
		console.log(error);
		return next(error);
	}
});

router.get('/:id', (req, res) => {});

router.post('/logout', (req, res) => {});

router.post('/login', (req, res) => {});

router.get('/:id/follow', (req, res) => {});

router.post('/:id/follow', (req, res) => {});

router.delete('/:id/follow', (req, res) => {});

router.delete('/:id/follower', (req, res) => {});

app.get('/:id/posts', (req, res) => {});

module.exports = router;
