const noblox = require('noblox.js')
const multer = require("multer")
const path = require("path")

const setCookie = async (req, res, next) => {
    try {
        const currentUser = await noblox.setCookie(process.env.ROBLOX_COOKIE)
        req.user = currentUser
    } catch (error) {
        console.log("error", error);
    }
    next()
}

const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(
            null,
            file.originalname
        );
    },
});

const upload = multer({
    storage: storage,
    // limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const checkfile = (file, cb) => {
            //Allowed text
            const filetype = /jpeg|png|gif|jpg|glb|gltf|obj|mp4|fbx|rbxm|octet-stream/;
            //check ext
            const extname = filetype.test(
                path.extname(file.originalname).toLowerCase()
            );
            //check mime
            const mimetype = filetype.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb("Error: image and 3D obj only");
            }
        };
        checkfile(file, cb);
    },
}).single("item");

module.exports = { upload, setCookie };