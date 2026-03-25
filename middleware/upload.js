import path from "path";
import multer from "multer";
import fs from "fs";

const productsFolder = path.resolve("uploads/products");
const promoFolder = path.resolve("uploads/promo");

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const url = req.originalUrl;

        let folder;
        if (url.includes("products")) folder = productsFolder;
        else if (url.includes("promo")) folder = promoFolder;
        else folder = path.resolve("uploads");

        ensureDir(folder);
        cb(null, folder);
    },

    filename: (req, file, cb) => {
        cb(null, "latest-" + Date.now() + "-" + file.originalname);
    }
});

export default multer({ storage });
