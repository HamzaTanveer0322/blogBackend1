const bcrypt=require('bcrypt');
const {User,blog,commits} = require('../model/usermodels')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const multer = require('multer');

const path = require('path');
const fs= require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: storage });



const signup=async(req,res)=>{

const {name,email,password} = req.body;
if(!name || !email || !password){
res.status(403).send("Please enter your name and email address and password")
}
try{
    const bcryptpassword=await bcrypt.hash(password,10);
 const newuser=new User({
    password: bcryptpassword,
    email,
    name
 })
 await newuser.save();
 res.status(201).json({ message: 'User registered successfully.' });
}catch(err){
console.log(err)
}
}


//login
const login=async(req,res)=>{
    const {email,password} = req.body;
    if( !(email || password)){
    
    res.status(401).send("Please enter your email address and password")
    }
    try{
       const existuser= await User.findOne({ email: email});
       if(! existuser){
      
        res.status(400).send("user not found"); 
       }
        const matchpass=await bcrypt.compare(password,existuser.password);
    if(!(matchpass)){
   
       res.status(401).send("password mismatch");
    }
    const acesstoken=await  accesstoken(existuser)
    const refreshedtoken=await refreshtoken(existuser)
    res.cookie('refresh', refreshedtoken, {
        httpOnly: true, 
        maxAge: 3600000*24 

    });
    console.log(refreshedtoken  )
    console.log(acesstoken  )
    return res.status(200).json({
      message: "Login successful!",
      acesstoken,
      user:{name:existuser.name,_id:existuser._id},

    });
 
    }catch(err){
    console.log(err)
    }
    }

    const accesstoken = async(existingUser)=>{
      return jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            process.env.Secret_key ,
            { expiresIn: "24h" }
          );
    }
    const refreshtoken =async (existingUser)=>{
       return jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            process.env.Secret_key ,
            { expiresIn: "30" }
          );
    }


    const logout = (req, res) => {
        res.cookie('token', '', {
          httpOnly: true, 
          maxAge: 0
        });
      
        res.status(200).json({ message: 'Logout successful' });
      };
//post blog
      const uploads = async (req, res) => {
        const parsedData = JSON.parse(req.body.data);
     
       if(!(parsedData.name))
    {
      return res.status(400).send(', name, and description are required.');
    }
        try {
          const date = new Date(Date.now());

          // Format the date to a local string
          const formattedDate = date.toLocaleString();
          
          console.log(req.body)
          const dataset = new blog({

            name: parsedData.name,
            img:req.file.path.replace(/\\/g, '/'),  // Assuming you're storing the file path
            auth: parsedData.auth,
            userid:parsedData.userid,
            discription: parsedData.discription,
            date:formattedDate,
            category:parsedData.category,
          });
      
          const savedata = await dataset.save();
      
          res.status(200).send('Blog uploaded successfully.');
        } catch (error) {
          res.status(500).send('Error saving the blog.');
        }
        }



        //blog get
        const blogget= async(req, res) => {
          console.log("call get blog");
          try {
            const data=await blog.find();
            res.status(200).json(data);

          } catch (error) {
              console.error('Error occurred:', error);
              res.status(500).send('Internal Server Error');
          }
      
        } 

        const viewblog=async(req,res)=>{
          try{

          
          const data = await blog.findById(req.params._id);
          if (!data) {
            return res.status(404).json({ message: 'Data not found' });
          }
          res.json(data);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error'   
       });
        }
      }
      //deleteblog
      const deleteblog=async(req,res)=>{
console.log(req.body._id,req.body.img);
try{
const check=await blog.findByIdAndDelete({_id:req.body._id})
if(!check){
  
  res.status(400).send("400  Bad Request")
  
}
fs.unlink(req.body.img, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File deleted successfully');
});
res.status(200).send("deleted successfuly")
}catch(err){ 
  console.log(err)
}

      }
      // account user blog
  const userblog=async(req,res)=>{
  try{
   const usersblog=await blog.find({userid:req.params.userid})
   if(!usersblog){
    res.status(400).send("not found user blog")
    return;
   }
   console.log(usersblog)
   res.status(200).json(usersblog);

  }catch(err)
{
  res.status(500).send(
    "error creating"
  )
}   
   }

   const addcomment = async (req, res) => {
    const { discription, Users, _id ,uid} = req.body;
    console.log(discription, Users, _id);
    // Check if all required fields are provided
    if (!discription||!Users||!_id||!uid ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    
  
    try {
      const date = new Date(Date.now());

      // Format the date to a local string
      const formattedDate = date.toLocaleString();
      
      console.log(formattedDate);
  
      const newComment = new commits({
        discription,
        user:Users,
        date:formattedDate,
        blogid: _id, 
        uid,
      });
        await newComment.save();
      res.status(200).json({ message: 'Comment created successfully.' });
  
    } catch (err) {
      console.error(err); 
      res.status(500).json({ message: 'Server error' });
    }
  };

  //view comments
  
  const viewcomment=async(req,res)=>{
    try{
console.log(req.params._id)
    const data = await commits.find({blogid:req.params._id});
    if (!data) {
      return res.status(404).json({ message: 'commit not found' });
    }
    console.log(data)
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error'   
 });
  }
} 
 //deletecommit  
 const deletecommit=async(req,res)=>{
 
  try{
  const check=await commits.findByIdAndDelete({_id:req.body._id})
  if(!check){
    
    res.status(400).send("400  Bad Request")
     
  }
  res.status(200).send("deleted successfuly")
  }catch(err){ 
    console.log(err)
  }
  
        }
        //viewblogbycategory
        const viewblogbycategory=async(req,res)=>{
          try{
           console.log( req.params.setC)
           const usersblog=await blog.find({category:req.params.setC})
           if(!usersblog){
            res.status(400).send("not found user blog")
            return;
           }
           console.log(usersblog)
           res.status(200).json(usersblog);
        
          }catch(err)
        {
          res.status(500).send(
            "error creating" 
          )
        }   
           }
        
module.exports ={login,signup,logout,viewblogbycategory,deletecommit,upload,uploads,blogget,deleteblog,viewblog,userblog,addcomment,viewcomment
}