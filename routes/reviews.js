const express = require('express');
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const review = require('../models/review.js');
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middlewear.js");




//creating a validate schema for review
const validatereview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }else{
        next();
    }

}
//post route reviews
router.post("/",isLoggedIn,validatereview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    //passing the review in the object
    let newReview = new review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview.author);
    //pushing the review in the main db
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.redirect(`/listing/${listing._id}`);

}))


// delete review rout
router.delete("/:reviewId",isLoggedIn,wrapAsync(async(req,res)=>{
    let{id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {pull : {reviews : reviewId}});
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/listing/${id}`);
}))

module.exports = router;
