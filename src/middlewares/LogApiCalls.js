const mongoose = require('mongoose');
const morgan = require('morgan');
const Log = require('./models/Log'); 

// Custom Morgan token
morgan.token('custom', (req, res) => {
    return JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode || 500,
        requestBody: req.body,
        responseBody: res.body,
        timestamp: new Date().toISOString(),
    });
});