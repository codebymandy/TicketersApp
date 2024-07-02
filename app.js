const express = require('express')
const mongoose = require('mongoose');
const path = require('path');
const tickerschema = require('./Tickerschema');
const app = express();
require('dotenv').config()
const port = 5000



mongoose.connect(process.env.Data)
  .then(() => console.log('Connected!'));


const fectAndstoredata = async() =>{

     let response = await fetch('https://api.wazirx.com/api/v2/tickers');

     let exchres = await fetch('https://open.er-api.com/v6/latest/USD'); 

     let exchdata = await exchres.json();

     let ustoinr = exchdata.rates.INR;

     let resdata = await  response.json();

    
     let data = Object.keys(resdata).slice(0, 10);

     const tickdata = data.map(key =>{

         const {name , last , buy , sell , volume ,base_unit} = resdata[key];

         return {
          name , 
          last ,
           buy: buy * ustoinr, 
           sell: sell * ustoinr,
            volume ,
            base_unit
          };
     });

    
     await tickerschema.deleteMany({});

     await tickerschema.insertMany(tickdata);


};

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Route to render

app.get('/' , async(req ,res) =>{

   const tickers = await tickerschema.find();

   res.render('tickers.ejs' , {tickers});
})

fectAndstoredata();


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})