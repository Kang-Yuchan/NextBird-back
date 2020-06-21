const express = require('express');
const db = require('../models');
const router = express.Router();

router.get('/', async (req, res, next) => {
	// GET /api/posts
	try {
		const posts = await db.Post.findAll({
			include: [
				{
					model: db.User,
					attributes: [ 'id', 'userId' ]
				}
			],
			order: [ [ 'createdAt', 'DESC' ] ]
		});
		res.json(posts);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

module.exports = router;
