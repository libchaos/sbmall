const express = require('express');
const router = express.Router();
const User = require('../models/user')
require('../util/util')



/* GET home page. */
router.post('/login', function(req, res, next) {
  const param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }

  User.findOne(param, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, {
          path: '/',
          maxAge: 1000*60*60
        })
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000*60*60
        })
        // req.session.user = doc
        res.json({
          status: '0',
          message: '',
          result: {
            userName: doc.userName
          }
        })
      } else {
        res.json({
          status: '1',
          message: 'user not found'
        })
      }
    }
  })

});

router.post('/logout', (req, res, next) => {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: '0',
    message: '',
    result: ''
  })
})

router.get('/checkLogin', function(req, res, next){
  if (req.cookies.userId) {
    res.send({
      status: '0',
      msg: '',
      result: req.cookies.userName || ''
    })
  } else {
    console.log('done')
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    })
  }
})
// user cart data
router.get('/cartList', (req, res, next) => {
  const userId = req.cookies.userId
  User.findOne({userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
})

router.post('/cartDel', (req, res, next) => {
  const userId = req.cookies.userId
  const productId = req.body.productId
  User.update({userId}, {$pull: {'cartList': {productId}}}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc
      })
    }
  })
})

router.post('/cartEdit', (req, res, next) => {
  const userId = req.cookies.userId
  const productId = req.body.productId
  const productNum = req.body.productNum
  const checked = req.body.checked
  User.update({userId,
    'cartList.productId': productId
  }, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc
      })
    }
  })
})

router.post('/editCheckAll', (req, res, next) => {
  const userId = req.cookies.userId
  const checkAll = req.body.checkAll ? 1: 0
  User.findOne({userId}, (err, user) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      user.cartList.forEach((item) => {
        item.checked = checkAll
      })
      user.save((err1, doc) => {
        if (err1) {
          res.json({
            status: '1',
            msg: err.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: doc
          })
        }
      })
    }
  })
})

router.get('/addressList', (req, res, next) => {
  const userId = req.cookies.userId;
  User.findOne({userId}, (err, doc) => {
    if (err) return
    res.json({
      status: '0',
      msg: '',
      result: doc.addressList
    })
  })
})


router.post('/setDefault', (req, res, next) => {
  const userId = req.cookies.userId
  const addressId = req.body.addressId
  User.findOne({userId}, (err, doc) => {
    if (err) return
    const addressList = doc.addressList
    addressList.forEach(item => {
      if (item.addressId == addressId) {
        item.isDefault = true
      } else {
        item.isDefault = false
      }
    })
    doc.save((err1, doc1) => {
      if (err1) return
      res.json({
        status: '0',
        msg: '',
        result: ''
      })
    })
  })
})

router.post('/delAddress', (req, res, next) => {
  const userId = req.cookies.userId
  const addressId = req.body.addressId
  User.update({
    userId
  }, {
    $pull: {
      'addressList': {
        'addressId': addressId
      }
    }
  }, (err, doc) => {
    if (err) throw err
    res.json({
      status: '0',
      msg: '',
      result: 'suc'
    })
  })
})

router.post('/payment', (req, res, next) => {
  const userId = req.cookies.userId
  const orderTotal = req.body.orderTotal
  const addressId = req.query.addressId
  User.findOne({userId}, (err, doc) => {
    if (err) throw err
    const address = ''
    doc.addressList.forEach(item => {
      if(addressId == item.addressId) {
        address = item
      }
    })
    const goodsList = []
    doc.cartList.forEach(item => {
      if(item.checked == '1') {
        goodsList.push(item)
      }
    })
    const platForm = '622'
    const r1 = Math.floor(Math.random() * 10)
    const r2 = Math.floor(Math.random() * 10)
    const sysDate = new Date().Format('yyyyMMddhhmmss')
    const createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
    const orderId = platForm + r1 + sysDate + r2
    const order = {
      orderId,
      orderTotal,
      addressInfo: address,
      goodsList: goodsList,
      orderStatus: '1',
      createDate,
    }
    if (doc.orderList.length>0) {
      doc.orderList.push(order)
    } else {
      doc.orderList = []
    }

    doc.save((err1, doc1) => {
      if (err1) throw err1
      res.json({
        status: '0',
        msg: '',
        result: {
          orderId: order.orderId,
          orderTotal: order.orderTotal
        }
      })
    })
  })
})

router.get('/orderDetail', (req, res, next) => {
  const userId = req.cookies.userId
  const orderId = req.query.orderId
  User.findOne({userId}, (err, userInfo) => {
    if (err) throw err
    const orderList = userInfo.orderList
    if (orderList.length <= 0) {
      return
    }
    let orderTotal = 0
    orderList.forEach(item => {
      if (item.orderId == orderId) {
        orderTotal = item.orderTotal
      }
    })
    if (orderTotal == 0) {
      return
    }
    res.json({
      status: '0',
      msg: '',
      result: {
        orderTotal,
        orderId
      }
    })

  })
})

router.get('/getCartCount', (req, res, next) => {
  const userId = req.cookies.userId
  console.log('--asas---', userId)
  User.findOne({userId}, (err, doc) => {
    if (err) throw err
    const cartList = doc.cartList
    console.log(cartList)
    let cartCount = 0
    cartList.forEach(item => {
      cartCount += parseInt(item.productNum)
    })
    console.log('-------', cartCount)
    res.json({
      status: '0',
      msg: '',
      result: cartCount
    })
  })
})
module.exports = router;

