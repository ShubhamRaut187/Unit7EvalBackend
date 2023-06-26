const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const {connection} = require("./db");
const {Usermodel} = require("./User.model");
const {Todomodel} = require("./Todo.model")

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup",async(req,res)=>{
    const{name,email,password} = req.body;
    const Hashed_Password = bcrypt.hashSync(password,8);
    const new_user = new Usermodel({
        name,
        email,
        password:Hashed_Password
    })
    await new_user.save();
    res.send("SignUp Successful");
})

app.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    let user = await Usermodel.findOne({email});
    if(!user){
        return res.send("Please SignUp");
    }
    const hash = user.password;
    const required_password = bcrypt.compareSync(password,hash);
    if(required_password){
        const token = jwt.sign({userId:user._id},"SecretCode");
        res.send({"Message":"Login Successful","token":token});
    }
    else{
        res.send({"Message":"Login Failed"});
    }
})

//Todo CRUD
app.get("/todo",(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    if(!token){
       return res.send("Please Login");
    }
    jwt.verify(token,"SecretCode",async(error,decoded)=>{
        if(decoded){
            console.log(decoded);
            const todos = await Todomodel.find({owner:decoded.userId});
            res.send({todos});
        }
        else{
            res.send("Please Login");
        }
    })
    
})

app.patch("/todoupdate/:id",async (req,res)=>{
    const {id} = (req.params);
    const {taskname,status,tag} = req.body;
    const token = req.headers.authorization.split(" ")[1];
    if(!token){
       return res.send("Please Login");
    }
    jwt.verify(token,"SecretCode",async(error,decoded)=>{
        if(decoded){
            console.log(decoded);
            const payload = {
                owner:decoded.userId,
                taskname,
                status,
                tag
            }
            const updatetodo = await Todomodel.findOneAndUpdate({_id:id},payload);
            res.send("Task Updated")
        }
        else{
            res.send("Failed to updated Task, Please Login");
        }
    })

    // const payload = {
    //     owner:decoded.userId,
    //     taskname,
    //     status,
    //     tag
    // }
    // const updatetodo = await Todomodel.findOneAndUpdate({_id:id},payload);
    //         res.send("Task Updated")
})

app.delete("/tododelete/:id",async(req,res)=>{
    const{id} = req.params;
    await Todomodel.findByIdAndDelete({_id:id});
    res.send("Task Deleted")
})

app.post("/todo/create",async (req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    if(!token){
        return res.send("Please Login");
    }
    const {taskname,status,tag} = req.body;
    jwt.verify(token,"SecretCode",async (error,decoded)=>{
        if(decoded){
            console.log(decoded);
            const new_todo = new Todomodel({
                owner:decoded.userId,
                taskname,
                status,
                tag
            })
            await new_todo.save();
            res.send("Todo Created");
        }
        else{
            res.send("Please Login");
        }
    })
})

app.listen(process.env.PORT,async ()=>{
    try {
        await connection;
        console.log(`Connection to MongoDB Atlas Successful on Server Port 8000`);
    } catch (error) {
        console.log("Connection Failed");
        console.log(error);
    }
})
