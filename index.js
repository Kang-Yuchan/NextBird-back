const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const hpp = require('hpp');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const passport = require('passport');
const passportConfig = require('./passport');
const dotenv = require('dotenv');
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');
const hashtagAPIRouter = require('./routes/hashtag');

dotenv.config();
const app = express();
db.sequelize.sync();
passportConfig();

const PORT = process.env.PORT;
const prod = process.env.NODE_ENV === 'production';

if (prod) {
	app.use(hpp());
	app.use(helmet());
	app.use(morgan('combined'));
	app.use(
		cors({
			origin: /nextbird\.site$/,
			credentials: true
		})
	);
} else {
	app.use(morgan('dev'));
	app.use(
		cors({
			origin: true,
			credentials: true
		})
	);
}

app.use('/', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: true,
		credentials: true
	})
);
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
	expressSession({
		resave: false,
		saveUninitialized: false,
		secret: process.env.COOKIE_SECRET,
		cookie: {
			httpOnly: true, // prevent hacking cookie
			secure: false, // change true when use https
			domain: prod && '.nextbird.site'
		},
		name: process.env.COOKIE_NAME
	})
);

app.get('/', (req, res) => {
	res.send('NextBird API Server is Listening!');
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);
app.use('/api/hashtag', hashtagAPIRouter);

app.listen(prod ? PORT : 3065, () => {
	console.log(prod ? `Listening server: localhost:${PORT} 👌` : `Listening server: localhost:3065 👌`);
});
