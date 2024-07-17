//requiring the env file
if(process.env.Node_ENV != "production"){
    require("dotenv").config()
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const review = require('./models/review.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategey = require('passport-local');
const user = require('./models/user.js');



//express routing
const listing = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const { createSecretKey } = require('crypto');


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));//to parse the post request
app.use(methodOverride("_method"))
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const mongo_url = "mongodb://127.0.0.1:27017/go_saffari";

const sessionOptions = {
    secret : "mysupersecretkey",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
};


// app.get("/",(req,res)=>{
//     res.send("all working");
// })


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategey(user.authenticate()));
//so the meaning of the above line is to use passport the use local startegy to authenticate through the user schema we made

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

//for the flash msg adn to acces the local variables
app.use((req,res,next)=> {
    res.locals.success = req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.curruser = req.user;
    next();
});

app.listen(8080,()=>{
    console.log("server is listning to port : 8080");
})

main()
    .then(()=>{
        console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    })

    
async function main() {
    await mongoose.connect(mongo_url);
}

app.get("/demouser", async (req,res)=>{
    let fakeuser = new user({
        email : "meet@gmail.com",
        username: "meet jain"
    });
    
    let registerduser = await user.register(fakeuser , "helloworld");
    res.send(registerduser);
})

app.use("/listing", listing);
app.use("/listing/:id/review", reviews);
app.use("/",userRouter);

// app.get("/testing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title : "my new villa",
//         description : "by the beach",
//         Image : "",
//         price : 12000,
//         location : "goa",
//         country : "India"
//     })

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("sucessful test");
// })



app.all("*", (req,res,next)=>{
    next(new expressError(404,"page not found"));
})
//error
app.use((err,req,res,next)=>{
    let {statuscode=500,message="something went wrong"} = err;
    res.status(statuscode).render("error.ejs" , {message});

})

