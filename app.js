const express = require('express');

const bodyParser = require('body-parser');

const mysql = require('mysql');

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const db = mysql.createConnection({
    host: "localhost",
    user:'root',
    password:'Cabbage123@',
    database:'mydb'

})

db.connect((err)=>{
    if(err){
        throw err
    }
    console.log("Connected");

})



const app = express();

const ejs = require('ejs');

app.set('view engine' , 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));


app.get("/register" , (req , res)=>{

    res.render("register");
});

app.post("/register" , async (req,res)=>{

     db.query('SELECT email FROM student WHERE email = ?' , [req.body.email] , (err , results)=>{
        if(err){
            console.log(err);
        }
        if(results.length > 0){
            console.log("User already exists");
            res.render("register");
        }
        else if(req.body.password!=req.body.repassword){
            console.log("Password doesn't match");
            res.render("register");
        }
    
    })

    let hashedpassword = await bcrypt.hash(req.body.password , 2);


    db.query('INSERT INTO student values (null,?,?,?,?,?)' , [req.body.first , req.body.last , req.body.email , hashedpassword , req.body.dob] , (err , results)=>{
            if(err){
                console.log(err);
            }
            else {
                res.redirect("/login");
                console.log(results);
            }
         });

      


   
      
     
     })
        
  
  

   

app.get('/login' , (req , res)=>{
    res.render("login");
})

app.listen(5000, (req , res)=>{
    console.log('Server is running');
});
