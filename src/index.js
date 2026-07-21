import "./config/envConfig.js";

console.log("Bucket name :",process.env.BUCKET_NAME)
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("Mongo db connection failed !!!", err);
});