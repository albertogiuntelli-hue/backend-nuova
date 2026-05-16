import multer from "multer";
import fs from "fs";

// Percorsi persistenti Railway
const uploadDirProducts = "/mnt/data/uploads/products";
const uploadDirPromo = "/mnt/data/uploads/promo";

// Assicura che le cartelle esistano
function ensureUploadDirs() {
    if (!fs.existsSync(uploadDirProducts)) {
        fs.mkdirSync(uploadDirProducts, { recursive: true });
    }
    if (!fs.existsSync(uploadDirPromo)) {
        fs.mkdirSync(uploadDirPromo, { recursive: true });
    }
}

ensureUploadDirs();

// Storage dinamico in base alla route
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (req.baseUrl.includes("products")) {
            cb(null, uploadDirProducts);
        } else if (req.baseUrl.includes("promo")) {
            cb(null, uploadDirPromo);
        } else {
            cb(null, "/mnt/data/uploads");
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

export default upload;
