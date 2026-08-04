import multer from "multer";
import multerS3 from "multer-s3"
import { s3 } from "./awsConfig.js";
const upload = multer({
    storage:multerS3({
        s3,
        limits: {
            fileSize: 100 * 1024 * 1024 // 100 MB
        },
        bucket:process.env.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            console.log("After multer")
            console.log("Original Name",file.originalname)
            cb(null, `uploads/${Date.now()}-${file.originalname}`);
        }
    })
}
)

export default upload