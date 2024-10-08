const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newschema = new Schema({
    name: {
        type: String,
        required: true, 
      },
    email: {
        type: String,
        required: true,
      }, 
    password: {
        type: String,
        required: true,
      },
})
const User = mongoose.model('User', newschema);
const Schemas = mongoose.Schema;
const blogschema=new Schemas({
   name: {
    type: String,
    required: true, 
  },
  category: {
    type: String,
    required: true, 
  },
  img: {
    type: String,
    required: true,
  },
  discription: {
    type: String,
    required: true, 
  },
  auth: {
    type: String,
    required: true, 
  },
  userid: {
    type: String,
    required: true, 
  },
  date: {
    type: String,
    required: true, 
  },

});

const blog = mongoose.model('blog', blogschema);
const CommentSchema=mongoose.Schema;
const comment=new CommentSchema({
  discription: {
    type: String,
    required: true, 
  },
  blogid:{
    type: String,
    required: true, 

  },
  uid:{
    type: String,
    required: true, 

  },
  user:{
    type: String,
    required: true, 
  },
  date:{
    type:String,
    required: true, 
  } 
})
const commits=mongoose.model('comment',comment);
module.exports={User,blog,commits}; 