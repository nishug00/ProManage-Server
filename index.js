const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");
const { incomingRequestLogger } = require('./middleware/index.js');

dotenv.config();
const app = express();

app.use(incomingRequestLogger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173'
}));

const indexRouter = require('./routes/index.js');
const userRouter = require('./routes/users.js');
const addPeopleRouter = require('./routes/member.js');
const taskRouter = require('./routes/tasks.js');

app.use('/api/v1', indexRouter);
app.use('/api/v1/user', userRouter); 
app.use('/api/v1/board',addPeopleRouter);
app.use('/api/v1/task',taskRouter);
console.log("/api/v1/task");


mongoose.connect(process.env.MONGOOSE_URI_STRING)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Listening on port ${process.env.PORT || 5000}`);
});
