const express = require('express')
const cors = require('cors')
const app = express()
const categoryRoute = require('./routes/categorys')
const userRoute = require('./routes/user')
const mongoose = require("mongoose");
const dotenv = require("dotenv");

require('dotenv').config()

const DB = process.env.DB_URL

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

const PORT = process.env.PORT || 8080;


app.use(cors())
app.use(express.json())

app.use('/api',categoryRoute)
app.use('/api',userRoute)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})