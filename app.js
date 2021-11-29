const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const helmet = require('helmet');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const UserRoutes = require('./routes/users');
const MovieRoutes = require('./routes/movies');
const NotFoundError = require('./errors/not-found-err');
const errorHandler = require('./middlewares/errorhandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const PORT = 3000;
const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.use(helmet());
app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use(auth);

app.use(UserRoutes);
app.use(MovieRoutes);
app.use(() => {
  throw new NotFoundError('Введён несуществующий адрес');
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
});
