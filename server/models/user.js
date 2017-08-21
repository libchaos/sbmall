const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = new Schema({
  userId: String,
  userName: String,
  userPwd: String,
  cartList: [
    {
      productNum: String,
      checked: String,
      productId: String,
      productName: String,
      salePrice: String,
      productImage: String,
    }
  ],
  addressList: [
    {
      addressId: String,
      userName: String,
      streetName: String,
      productCode: Number,
      tel: Number,
      isDefault: Boolean,
    }
  ],
  orderList: [
    {
      orderId: String,
      orderTotal: Number,
      addressInfo: Object,
      goodsList: Array,
      orderStaus: String,
      createDate: Date,
    }
  ]
})

module.exports = mongoose.model('User', user)
