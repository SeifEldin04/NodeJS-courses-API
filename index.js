const express = require('express')
const app = express()
const cors = require('cors');

app.use(cors());
app.use(express.json());

require('dotenv').config()

const httpStatusText = require('./utils/httpStatusText')

// DB
const mongoose = require('mongoose');
url = process.env.MONGOOSE_URL;

mongoose.connect(url).then(() => {
    console.log('Mongoose DB server connected');
})

// Courses router
coursesRouter = require('./routes/courses.route')
app.use('/api/courses' , coursesRouter);

// Users Router
usersRouter = require('./routes/users.route')
app.use('/api/users', usersRouter)

// global error jandler
app.use((eror, req, resp, next) => {
    resp.status(eror.statusCode || 500).json({ ststus: eror.statusMessage || httpStatusText.ERROR, message: eror.message, code: eror.statusCode || 500 , data:null })
});

// handler for invalid API routing
app.all('*', (req, resp, next) => {
    return resp.status(500).json({ ststus: httpStatusText.ERROR, message: 'This resource is not available', code: 500 })
})

app.listen(process.env.PORT, () => {
    console.log('Welcome to users API');
})


