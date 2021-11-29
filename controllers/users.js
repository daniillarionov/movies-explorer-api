const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictRequestError = require('../errors/conflict-request-err');
const UnauthorizedError = require('../errors/unauth-err.');

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials({ email, password })
    .then((user) => {
      if (user) {
        const token = jwt.sign(
          { _id: user._id },
          'super-strong-secret',
          { expiresIn: '7d' },
        );
        res.send({ token });
      }
    })
    .catch(() => {
      throw new UnauthorizedError('Неправильные почта или пароль');
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  const userId = req.res.req.user._id;
  return User.findById(userId)
    .orFail(new Error('Not valid id'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Невалидный id'));
      }
      if (err.message === 'Not valid id') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const password = hash;
      return User.create({
        name, email, password,
      })
        .then(() => res.status(200).send({
          data: {
            name, email,
          },
        }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
          }
          if (err.name === 'MongoServerError' && err.code === 11000) {
            next(new ConflictRequestError('Переданы некорректные данные при создании пользователя'));
          } else {
            next(err);
          }
        });
    });
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(new Error('Not valid id'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      if (err.message === 'Not valid id') {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getUser,
  createUser,
  updateUser,
  login,
};
