const express = require('express');
const dotenv = require('dotenv');
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');

dotenv.config();
const app = express();
db.sequelize.sync();

const PORT = process.env.PORT;

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);

app.listen(PORT, () => {
	console.log(PORT ? `Listening server: localhost:${PORT} 👌` : 'Your server is dead... 💀');
});
