const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
  productId: String,
  productName: String,
  salePrice: Number,
  productImage: String,
  productNum: Number,
  checked: Number,
})

module.exports = mongoose.model('Good', productSchema)
