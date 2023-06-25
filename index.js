
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/category.js'
import productRoutes from './routes/product.js'
import cors from 'cors';
// import router from './routes/auth.js'

dotenv.config();

console.log(process.env.MONGO_URI)
//'mongodb://localhost:27017/student'

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('Connnected to database successfully'))
.catch(err=>console.log('error == ', err));

// console.log('Process=>',process);
dotenv.config();

const port = process.env.port;
// console.log('this is node server');

// const express = require('express');

const app = express();



// for cross platform api
app.use(cors());

//use of middileware

app.use(morgan('dev'));






// app.use((req, res, next) => {
//     console.log('This is my own middileware');
//     next();
// })


// app.get('/users', function(req, res){
//     res.json({
//         msg : 'the express server running',
//         srn : 24,
//         appno: 20
//     })
// })


//middileware for json data
app.use(express.json());

//router
app.use('/api',authRoutes);
app.use('/api',categoryRoutes);
app.use('/api',productRoutes);


app.listen(port, function(){
    console.log(`Express server is running on port ${port}`);
})



//.env file
//.gitignore
//http://localhost:8000/users this url will hit
