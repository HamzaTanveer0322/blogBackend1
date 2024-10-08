import {v2 as cloudinary}from "cloudinary";
import fs from " fs";



import { v2 as cloudinary } from 'cloudinary';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDNARY_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET
    });
    
const uploadcloudinary=async(localfilepath)=>{
    try{
    if(!localfilepath){
        return null;
    }
    const response=await cloudinary.uploader.upload(localfilepath,{
        resource_type:"auto"
    })
     console.log("upload successful")
     console.log(response.url);
     return response;



    }catch(e){
        fs.unlinkSync(localfilepath)
       
        return null;
    }
}
module.exports =uploadcloudinary;