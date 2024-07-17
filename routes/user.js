const express = require('express');
const router = express.Router();
const user = require('../models/user.js'); 
const wrapAsync = require("../utils/wrapAsync.js");
const { route } = require('./listing.js');
const passport = require('passport');
const review = require('../models/review.js');
const {saveredirectUrl}  = require('../middlewear.js');

//get rout
router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs");
})

//post route
router.post("/signup", wrapAsync(async(req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new user({email , username});
        const registerduser = await user.register(newUser,password);
        console.log(registerduser);
        req.login(registerduser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","welcome to go saffari");
            res.redirect("/listing");
        })
    }catch (e) {
        req.flash("error", e.message);
        res.redirect("/listing");
    }
}))

//login route
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

// login authenticate
router.post("/login",saveredirectUrl,passport.authenticate("local",{
    failureRedirect : "/login",
    failureFlash : true,
}),async(req,res)=>{
    let {username} = req.body;
    req.flash("success",`welcome back ${username}!`);
    console.log(`users redirect url path "${res.locals.redirectUrl}"`)
    let redirecturls = res.locals.redirectUrl || "/listing";
    res.redirect(redirecturls);
})


//logout
router.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }

        req.flash("success","you are logeed out now");
        res.redirect("/listing");
    })
})
module.exports = router;
