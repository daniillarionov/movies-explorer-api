const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorhandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const AllRoutes = require('./routes/index');
const apiLimiter = require('./middlewares/ratelimit');

const { NODE_ENV, MONGO_URL } = process.env;

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.use(helmet());
app.use(requestLogger);

app.use(AllRoutes, apiLimiter);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
});
