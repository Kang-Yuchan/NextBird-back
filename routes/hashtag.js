const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/:tag', async (req, res, next) => {
	try {
		const posts = await db.Post.findAll({
			include: [
				{
					model: db.Hashtag,
					where: { content: decodeURIComponent(req.params.tag) }
				},
				{
					model: db.User,
					attributes: [ 'id', 'userId' ]
				},
				{
					model: db.Image
				},
				{
					model: db.User,
					through: 'Like',
					as: 'Likers',
					attributes: [ 'id' ]
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
