import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.get("/",(req,res)=>{
    res.send("Hello world")
})

app.get("/twitter",(req,res)=>{
    res.send("aditikathe.twitter")
})
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on server ${process.env.PORT}`)
})