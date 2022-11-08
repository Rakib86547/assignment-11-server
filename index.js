const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('api running')
});

app.listen(port, (req, res) => {
    console.log(`server is running ${port}`)
})