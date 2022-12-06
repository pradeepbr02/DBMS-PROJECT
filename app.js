const express = require('express');

const bodyParser = require('body-parser');

const mysql = require('mysql');

const bcrypt = require('bcrypt')

const session = require('express-session')

const cookieParser = require('cookie-parser')

const passport = require('passport');

const passportLocal = require("passport-local").Strategy;

const app = express();

app.use(session({
    secret:"Anykey",
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60*60*24

    }
}))



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






const ejs = require('ejs');
const { Cookie } = require('express-session');
const { text } = require('body-parser');

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

   


    db.query('INSERT INTO student values (null,?,?,?,?,? , ?)' , [req.body.first , req.body.last , req.body.email , hashedpassword , req.body.dob , req.body.pno] , (err , data)=>{
            if(err){
                console.log(err);
            }
            else {
                res.redirect("/login");
                console.log(data);
            }
         });

})

        
  
  app.get('/login' , (req , res)=>{
    res.render("login");
})
let info=  {
id : Number,
name : String,
email : String,
contact : String

}
app.post('/login' ,  (req , res)=>{
    let user_password = req.body.password;
    let user_email = req.body.email;

    db.query('select * from student where email=?' , [user_email] ,  (err , data)=>{
        if(data.length > 0){
            for(let i =0;i<data.length;i++){
            bcrypt.compare( user_password,data[i].password,(err , check)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log(req.session);
                    req.session.student_id = data[i].student_id;
                    console.log(req.sessionID);

                     info = {
                        id : data[0].student_id,
                        name :data[0].first_name,
                        email : data[0].email,
                        contact : data[0].contact

                    }

                    res.redirect("/profile");
                    

                     
                    

                    
                   
                }
            });
        
        }
    }
        else{
            console.log("result not fetched");
        }

     
})
})

app.get('/', (req , res)=>{
    res.render("home");
})

app.get("/profile" , (req , res)=>{

  res.render("profile" , {info : info});


})

app.get("/profile/dashboard" , (req , res)=>{
    res.render("dashboard");
})

app.get("/admin/login" , (req , res)=>{
    res.render("adminLogin");
});

app.post('/admin/login' , (req , res)=>{
    let mail = req.body.mail;
    let password = req.body.passsword;
    db.query('select * from tutor where email = ?' , [mail] , (err, results)=>{
        if(err){
            throw err;

        }
        if(results.length > 0){
            if(password != results[0].password){
                console.log("Passwords dont match");
                res.redirect("/admin/login");
            }
            else{
                console.log("OKk");
                res.redirect('/student/attendence');
            }
        }
        else{
            console.log("results not fetched");
        }
    })

});

app.get("/student/attendence" , (req, res)=>{
    res.send("<h1>Attendence Porstal</h1>")
})

app.listen(5000, (req , res)=>{
    console.log('Server is running');
});
