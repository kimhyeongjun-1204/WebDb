const express = require('express');
var router = express.Router();
var purchase = require('../lib/purchase');
 
const path = require('path');

// 특정 상품 조회 
router.get('/detail/:merId', (req,res) => {
    purchase.purchasedetail(req,res); 
})

// 결제 버튼 클릭 
router.post('/purchase_process', (req,res) => {
    purchase.purchase_process(req,res); 
})

// 구매 목록 조회 
router.get('/', (req,res) => {
    purchase.purchaselist(req,res); 
})

// /cancel/:purchaseId  : 특정 구매 상품 구매 취소 
router.get('/cancel/:purchaseId',(req,res) => {
    purchase.cancel(req,res); 
})

// 장바구니 페이지 
router.get('/cart', (req,res) => {
    purchase.cart(req,res); 
})

// 장바구니 CREATE 
router.post('/cart_process', (req,res) => { 
    purchase.cart_process(req,res); 
})

router.post('/cart/multi_purchase_process', (req,res) => {
    purchase.multi_purchase_process(req,res); 
})

router.post('/cart/multi_delete_process',(req,res) => {
    purchase.multi_delete_process(req,res); 
})
module.exports = router;