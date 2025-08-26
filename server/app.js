const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const allRoutes = require('./routes/allRoutes');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, HEAD, OPTIONS, POST, PUT, DELETE"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

app.use(bodyParser.json());
connectDB();

// Routes
app.use('/pgc-api', allRoutes);

// Error handling middleware
app.use(errorHandler);

app.get('/', (req, res) => {
    res.send('APIs SERVER is perfectly working..');

    res.json({
        message: 'Welcome to the API',
        api_version: '1.0',
    });
});

// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).json({
        message: "Your requested API not found",
    });
});

app.listen(port, () => {
    console.log(`Server running at port:${port}`);
});
