const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/people';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const userId = req.params.id; // assumes user ID is passed as URL param

        if (!userId) {
            return cb(new Error('Missing user ID in URL parameters'), null);
        }

        const name = `${userId}${ext}`;
        cb(null, name);
    }
});

const upload = multer({ storage });

module.exports = upload;
