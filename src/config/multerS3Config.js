import multer from "multer";
import multerS3 from "multer-s3"
import { s3 } from "./awsConfig.js";


const upload = multer({
    storage:multerS3({
        s3,
        bucket:process.env.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            cb(null, `uploads/${Date.now()}-${file.originalname}`);
        }
    })
}
)

export default upload