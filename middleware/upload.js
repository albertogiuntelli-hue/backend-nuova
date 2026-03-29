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

const upload = multer({ storage });

export default upload;
