const express = require('express');
var router = express.Router();
var product = require('../lib/product');

const multer = require('multer');
const path = require('path');

// 파일이 저장될 디렉터리와 파일명 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/image/');  // 파일이 저장될 디렉터리
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);  // 원본 파일의 확장자
        const originalName = file.originalname.replace(ext, ''); // 확장자를 제외한 원본 파일 이름
        cb(null, originalName + ext);  
    }
});

// multer 설정
const upload = multer({ storage: storage });


router.get('/view', (req, res) => {
    product.view(req, res);
});

router.get('/create', (req, res) => {
    product.create(req, res);
});

router.post('/create_process',upload.single('uploadFile'), (req, res) => {
    product.create_process(req, res);
});

router.get('/update/:merId', (req, res) => {
    product.update(req, res);
});

router.post('/update_process',upload.single('uploadFile') ,(req, res) => {
    product.update_process(req, res);
});

router.get('/delete/:merId', (req, res) => {
    product.delete_process(req, res);
});

module.exports = router;
