const express= require('express');
const router= express.Router();
 
var root = require('../lib/root');
 
router.get('/', (req,res)=>{
    root.home(req,res); 
})

router.get('/category/:main_id/:sub_id', (req,res) => {
    root.categoryview(req,res); 
})

router.post('/search', (req,res) => {
    root.search(req,res); 
})

router.get('/detail/:merId', (req,res) => {
    root.detail(req,res); 
})





module.exports = router;