const router = require('express').Router();
const { createUser, login } = require('../controllers/users');
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const UserRoutes = require('../routes/users');
const MovieRoutes = require('../routes/movies');
const NotFoundError = require('../errors/not-found-err');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

router.use(auth);

router.use(UserRoutes);
router.use(MovieRoutes);
router.use(() => {
  throw new NotFoundError('Введён несуществующий адрес');
});

module.exports = router;