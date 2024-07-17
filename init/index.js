const mongoose = require('mongoose');
const initdata = require ("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/go_saffari";

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


const initDb = async()=>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj, owner: "669433ed8393864f70d7f440"}));
    // initdata.data = initdata.data.map((obj)=>({...obj,geometry: { type:{ type : 'Point' , enum: ['Point']}, coordinates: [ 2.3483915, 48.8534951 ] }}));
    await Listing.insertMany(initdata.data);
    console.log("data was initialised");
}

initDb();