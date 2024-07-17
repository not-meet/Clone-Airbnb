const mongoose = require('mongoose');
const schema = mongoose.Schema;
const review = require("./review");

const listingSchema = new schema({
    title : {
        type :String,
        required : true,
    },
    description :  String,
    image : {
        url : String,
        filename : String,     
    },
    price : Number , 
    location : String,
    country : String,
    reviews : [{
        type : schema.Types.ObjectId,
        ref : "review",
    }],
    owner : {
        type : schema.Types.ObjectId,
        ref: "User"
    },
    geometry : {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    }
});


//mongoose find one and delete middleware it will delete the reviews present in the list of values
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await review.deleteMany({_id: {$in: listing.reviews}});
    }
})

//passing model
const Listing =  mongoose.model("Listing",listingSchema);

module.exports = Listing; 



