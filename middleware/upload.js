import multer from "multer";
import path from "path";
import fs from "fs";

// Cartella temporanea compatibile con Railway
const uploadDir = "/tmp/uploads";

// Assicura che la cartella esista
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + ext;
        cb(null, name);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(csv)$/i)) {
            return cb(new Error("Sono accettati solo file CSV"));
        }
        cb(null, true);
    }
});

export default upload;
