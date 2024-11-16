const express = require('express');
 
var router = express.Router()
var code = require('../lib/code');

// 1. 조회 
router.get('/view', (req,res) => {
    code.view(req,res); 
})

// 2. 생성 
router.get('/create', (req,res) => {
    code.create(req,res); 
})

router.post('/create_process', (req,res) => {
    code.create_process(req,res);
})

// 3. 수정 
router.get('/update/:main/:sub/:start/:end', (req,res) => {
    code.update(req,res);
})

router.post('/update_process', (req,res) => {
    code.update_process(req,res);
})

// 4. 삭제 
router.get('/delete/:main/:sub/:start/:end', (req,res) => {
    code.delete_process(req,res); 
})

module.exports=router;