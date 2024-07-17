const Listing = require("./models/listing");
// const review = require("./models/review");


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","log in to create new post");
        return res.redirect("/login");
    }next();
}


module.exports.saveredirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }    
    next();
}


module.exports.isOwner = async (req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    console.log(listing)
    if(!listing.owner.equals(res.locals.curruser._id)){
        req.flash("error","you dont have the acces to make changes");
        return res.redirect(`/listing/${id}`);
    }next();
}


// module.exports.reviewisAuthor = async (req,res,next)=>{
    // let { id,reviewId } = req.params;
    // let review = review.findById(reviewId);
    // console.log(review.author)
    // if(!review.author.equals(res.locals.curruser._id)){
        // req.flash("error","you dont have the acces to make changes");
        // return res.redirect(`/listing/${id}`);
    // }next();
// }