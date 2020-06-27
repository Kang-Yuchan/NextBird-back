const express = require('express');
const db = require('../models');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, done) {
			done(null, 'uploads');
		},
		filename(req, file, done) {
			const ext = path.extname(file.originalname); // ex) .png
			const basename = path.basename(file.originalname, ext); // ex) kangyuchan
			done(null, basename + new Date().valueOf() + ext); // ex) kangyuchan1592914971961.png
		}
	}),
	limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

router.get('/:id', async (req, res, next) => {
	try {
		const post = await db.Post.findOne({
			where: { id: req.params.id },
			include: [
				{
					model: db.User,
					attributes: [ 'id', 'userId' ]
				},
				{
					model: db.Image
				}
			]
		});
		return res.json(post);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

router.post('/', upload.none(), async (req, res) => {
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
		if (req.body.image) {
			if (Array.isArray(req.body.image)) {
				const images = await Promise.all(
					req.body.image.map((image) => {
						return db.Image.create({ src: image });
					})
				);
				await newPost.addImages(images);
			} else {
				const image = await db.Image.create({ src: req.body.image });
				await newPost.addImage(image);
			}
		}
		const fullPost = await db.Post.findOne({
			where: { id: newPost.id },
			include: [
				{
					model: db.User
				},
				{
					model: db.Image
				}
			]
		});
		res.json(fullPost);
	} catch (error) {}
});

router.post('/images', upload.array('image'), (req, res) => {
	res.json(req.files.map((v) => v.filename));
});

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
			order: [ [ 'createdAt', 'DESC' ] ],
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

router.post('/:id/like', async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).send('Please log in.');
		}
		const post = await db.Post.findOne({
			where: {
				id: req.params.id
			}
		});
		if (!post) {
			return res.status(404).send('This post is not exist.');
		}
		await post.addLiker(req.user.id);
		return res.json({ userId: req.user.id });
	} catch (error) {
		console.error(error);
		next(error);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).send('Please log in.');
		}
		const post = await db.Post.findOne({ where: { id: req.params.id } });
		if (!post) {
			return res.status(404).send('This post is not exist.');
		}
		await db.Post.destroy({ where: { id: req.params.id } });
		res.send(req.params.id);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

router.delete('/:id/like', async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).send('Please log in.');
		}
		const post = await db.Post.findOne({
			where: {
				id: req.params.id
			}
		});
		if (!post) {
			return res.status(404).send('This post is not exist.');
		}
		await post.removeLiker(req.user.id);
		return res.json({ userId: req.user.id });
	} catch (error) {
		console.error(error);
		next(error);
	}
});

router.post('/:id/retweet', async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).send('Please log in.');
		}
		const post = await db.Post.findOne({
			where: {
				id: req.params.id
			},
			include: [
				{
					model: db.Post,
					as: 'Retweet'
				}
			]
		});
		if (!post) {
			return res.status(404).send('This post is not exist.');
		}
		if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
			return res.status(403).send("Can't retweet self post. ");
		}
		const retweetTargetId = post.RetweetId || post.id;
		const exPost = await db.Post.findOne({
			where: {
				UserId: req.user.id,
				RetweetId: retweetTargetId
			}
		});
		if (exPost) {
			return res.status(403).send('You retweet this post already.');
		}
		const retweet = await db.Post.create({
			UserId: req.user.id,
			RetweetId: retweetTargetId,
			content: 'retweet'
		});
		const retweetWithPrevPost = await db.Post.findOne({
			where: { id: retweet.id },
			include: [
				{
					model: db.User,
					attributes: [ 'id', 'userId' ]
				},
				{
					model: db.Post,
					as: 'Retweet',
					include: [
						{
							model: db.User,
							attributes: [ 'id', 'userId' ]
						},
						{
							model: db.Image
						}
					]
				}
			]
		});
		return res.json(retweetWithPrevPost);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

module.exports = router;
