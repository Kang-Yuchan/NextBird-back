const express = require('express');
const db = require('../models');
const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const hashtags = req.body.content.match(/#[^\s]+/g);
		const newPost = await db.Post.create({
			content: req.body.content,
			UserId: req.user.id
		});
		if (hashtags) {
			const result = await Promise.all(
				hashtags.map((tag) =>
					db.Hashtag.findOrCreate({
						where: {
							content: tag.slice(1).toLowerCase()
						}
					})
				)
			);
			await newPost.addHashtags(result.map((r) => r[0]));
		}
		const fullPost = await db.Post.findOne({
			where: { id: newPost.id },
			include: [
				{
					model: db.User
				}
			]
		});
		res.json(fullPost);
	} catch (error) {}
});

router.post('/images', (req, res, next) => {});

router.get('/:id/comments', async (req, res, next) => {
	try {
		const post = await db.Post.findOne({
			where: {
				id: req.params.id
			}
		});
		if (!post) {
			return res.status(404).send('This post is not exist.');
		}
		const comments = await db.Comment.findAll({
			where: {
				PostId: req.params.id
			},
			order: [ [ 'createdAt', 'ASC' ] ],
			include: [
				{
					model: db.User,
					attributes: [ 'id', 'userId' ]
				}
			]
		});
		return res.json(comments);
	} catch (error) {
		console.error(error);
		return next(error);
	}
});

router.post('/:id/comment', async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).send('Please log in.');
		}
		const post = await db.Post.findOne({ where: { id: req.params.id } });
		if (!post) {
			return res.status(404).send('This post is not exist.');
		}
		const newComment = await db.Comment.create({
			PostId: post.id,
			UserId: req.user.id,
			content: req.body.content
		});
		await post.addComment(newComment.id);
		const comment = await db.Comment.findOne({
			where: {
				id: newComment.id
			},
			include: [
				{
					model: db.User,
					attributes: [ 'id', 'userId' ]
				}
			]
		});
		return res.json(comment);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

module.exports = router;
