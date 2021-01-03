const express = require('express');
const cors = require('cors');
const colors = require('colors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const subscriberRoutes = require('./routes/subscriberRoutes');
const authorRoutes = require('./routes/authorRoutes');
connectDB() ;

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use('/subscriber', subscriberRoutes);
app.use('/author', authorRoutes);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});
