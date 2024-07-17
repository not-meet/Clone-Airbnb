const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const expressError = require("../utils/expressError.js");
const Listing = require("../models/listing.js");
const passport = require('passport');
const {isLoggedIn ,isOwner} = require("../middlewear.js");
const multer = require('multer');
const {storage} =  require("../cloudConfig.js");
const upload = multer({storage})
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding.js');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


//creating a validation function
const validateSchema =(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errmsg);
    }else{
        next();
    }
}

//index route
router.get("/",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}))

// new route
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs")
})

//show route 
router.get("/:id", wrapAsync(async(req,res)=>{
    // if(!req.body.Listing){
    //     throw new expressError(400,"send valid data for listing");
    // }
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path :"reviews",populate : {path:"author"}}).populate("owner");
    // console.log(listing);
    if(!listing){
        req.flash("error","The listing dose not exist");
        return res.redirect("/listing");
    }
    res.render("listings/show.ejs",{listing})
}))

//create route
router.post("/",isLoggedIn,upload.single('listing[image]'),wrapAsync(async(req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()
    let url  = req.file.path;
    let filename = req.file.filename;
    // console.log(url+"..."+filename);
    const newlst = new Listing(req.body.listing);
    newlst.owner= req.user._id;
    newlst.image = {url,filename}; 
    newlst.geometry = response.body.features[0].geometry;
    console.log(newlst);
    await newlst.save();
    req.flash("success","New listing created");
    res.redirect("/listing");
    console.log("new data added to the database");
}))


//edit route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","The listing dose not exist");
        return res.redirect("/listing");
    }
    res.render("listings/edit.ejs",{listing});
}))


//update route
router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),wrapAsync(async(req,res)=>{
    let { id }= req.params;
    let listing = await Listing.findByIdAndUpdate(id ,{...req.body.listing});
    console.log(listing.file);
    if(typeof req.file !== 'undefined'){
        let url  = req.file.path;
        let filename = req.file.filename;
        listing.image  = {url,filename};
        await listing.save();
    }
    req.flash("success","listing updated");
    res.redirect(`/listing/${id}`);
}))


//delete route 
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let delList = await Listing.findByIdAndDelete(id);
    console.log(delList);
    req.flash("success","Listing deleted");
    res.redirect("/listing");
}))

module.exports = router;
