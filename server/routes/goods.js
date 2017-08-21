const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Goods = require('../models/goods')
const User = require('../models/user')

mongoose.connect('mongodb://127.0.0.1:27017/dumall')

mongoose.connection.on('connected', () => console.log('mongodb connected'))

mongoose.connection.on('error', ()=> console.log('mongo failed'))
mongoose.connection.on('disconnected', () => console.log('diconnected'))

// query
router.get('/list', (req, res, next) => {
  const page = parseInt(req.query['page'])
  const pageSize = parseInt(req.query['pageSize'])
  const sort = parseInt(req.query['sort'])
  const priceLevel = req.query['priceLevel']
  const skip = (page-1) * pageSize
  console.log(sort)
  let priceGt = ''
  let priceLte = ''
  let params = {}
  if (priceLevel !== 'all') {
    switch(priceLevel) {
      case '0':
        priceGt = 0
        priceLte = 100
        break
      case '1':
        priceGt = 100
        priceLte = 500
        break
      case '2':
        priceGt = 500
        priceLte = 1000
        break
      case '3':
        priceGt = 1000
        priceLte = 5000
        break
      default:
        break
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }

  const goods = Goods.find(params).skip(skip).limit(pageSize)
  goods.sort({salePrice: sort})
  goods.exec((err, doc) => {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      })
    } else {
      res.json({
        status: 0,
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }

      })
    }

  })
})

// added cart
router.post('/addCart', (req, res, next) => {
  const userId = req.cookies.userId
  const productId = req.body.productId
  User.findOne({userId}, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      console.log('userDoc: ', userDoc)


      if (userDoc) {
        let goodsItem = ''
        userDoc.cartList.forEach((item) => {
          if (item.productId === productId) {
            goodsItem = item
            item.productNum++
          }
        })
        if (goodsItem) {
          userDoc.save((err2, doc2) => {
                if(err) {
                res.json({
                  status: '1',
                  msg: err.message
                })
              } else {
                res.json({
                  status: '0',
                  msg: '',
                  result: 'suc'
                })
              }
            })
        } else {
        Goods.findOne({productId}, (err1, doc) => {
          if(err) {
            res.json({
              status: '1',
              msg: err1.message
            })
          } else {
            if (doc) {
              console.log('dsfsfasfdadfafafdsf')
              doc.productNum = 1
              doc.checked = 1
              userDoc.cartList.push(doc)
              userDoc.save((err2, doc2) => {
                 if(err) {
                  res.json({
                    status: '1',
                    msg: err1.message
                  })
                } else {
                  res.json({
                    status: '0',
                    msg: '',
                    result: 'suc'
                  })
                }
              })
            }
          }
        })
        }

      }
    }
  })
})



module.exports = router
