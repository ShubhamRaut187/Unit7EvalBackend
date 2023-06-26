const mongoose = require("mongoose");

const todoSchema = mongoose.Schema({
    owner:String,
    taskname:String,
    status:{type:String, enum:["Pending","Completed"], default:"Pending"}, 
    tag:{type:String, enum:["Personal","Official","Family"]}
})

const Todomodel = mongoose.model("todo",todoSchema);

module.exports = {
    Todomodel
}