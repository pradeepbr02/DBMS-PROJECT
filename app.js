const express = require('express');

const bodyParser = require('body-parser');

const mysql = require('mysql');

const bcrypt = require('bcrypt')

const session = require('express-session')

const cookieParser = require('cookie-parser')

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

app.use(session({
    secret:"Anykey",
    resave:true,
    saveUninitialized:true,
    cookie:{
        maxAge:60*60*24

    }
}))

const ejs = require('ejs');
const { Cookie } = require('express-session');

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

app.post('/login' ,  (req , res)=>{
    let user_password = req.body.password;
    let user_email = req.body.email;

    db.query('select * from student where email=?' , [user_email] ,  (err , results)=>{
        if(results.length > 0){
            for(let i =0;i<results.length;i++){
            bcrypt.compare( user_password,results[i].password,(err , check)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log(req.session);
                    req.session.student_id = results[i].student_id;
                    console.log("OK");
                }
            });
        
        }
    }
        else{
            console.log("result not fetched");
        }

     
})
})

app.listen(5000, (req , res)=>{
    console.log('Server is running');
});
