//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
var fs=require("fs");
var path=require("path");
var multer=require("multer");
var imgModel=require("./model");

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://shri:shri788@cluster0.sczkf.mongodb.net/userdb?retryWrites=true&w=majority",{useNewUrlParser:true});



const userSchema={
    username: String,
    password: String
};
const User= new mongoose.model("User",userSchema);

var storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"uploads")
    },
    filename: (req,file,cb)=>{
        cb(null,file.fieldname + '-' +Date.now())
    }
});

var upload = multer({storage: storage});

app.get("/", function(req,res){
    res.render("home");
});


app.get("/login", function(req,res){
    const er="";
    const not="";
    res.render("login",{not:not,eror:er});
});


app.get("/register",function(req,res){
    const str="";
    res.render("register", {value:str});
});
app.get("/gallery",function(req,res){
    const er="";
    const not="";
    res.render("login",{not:not,eror:er});
})
app.post("/register",function(req,res){
    const un=req.body.username;
    const pass=md5(req.body.password);
    User.findOne({username:un},function(err,find){
        if(err)
        {
            console.log(err);
        }
        else{
            if(find)
            {
                str="username already exists !!"
                res.render("register", {value:str});
            }else{
                const newuser=new User({
                    username:un,
                    password:pass
                });
                newuser.save(function(err){
                    if(err){
                        console.log(err);
                    }else
                    {
                        res.render("gallery");
                    }
                });
                
            }
        }
    })
})
app.post("/login",function(req,res){
    const un=req.body.username;
    const pass=md5(req.body.password);
    User.findOne({username:un},function(err,find){
        if(err){
            console.log(err);
        }else{
            if(find){
                if(find.password===pass)
                {
                    res.render("gallery");
                }else{
                    er="invalid password!"
                    not=""
                    res.render("login",{eror:er,not:not});
                }
            }else{
                not="account doesnt exist please register"
                er=""
                res.render("login", {not:not,eror:er});
            }
        }
    });
})
app.post("/gallery",function(req,res){
    imgModel.find({}, (err, items) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            res.render('gallery2', { items: items }); 
        } 
    }); 
})
app.get('/gallery2', (req, res) => { 
    imgModel.find({}, (err, items) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            res.render('gallery2', { items: items }); 
        } 
    }); 
}); 

app.post('/gallery2', upload.single('image'), (req, res, next) => { 
  
    var obj = { 
        username:req.body.name,
        img: { 
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
            contentType: 'image/png'
        } 
    } 
    imgModel.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
             item.save(); 
            res.redirect("gallery2");  
        } 
    }); 
}); 
let port=process.env.PORT;
if(port==null || port==""){
    port=3000;
}
app.listen(port,function(){
    console.log("app started at server");
});