import Category from "../models/category.js";
import slugify from "slugify";
import fs from "fs";
import Product from "../models/product.js";
import product from "../models/product.js";
import dotenv from 'dotenv';

import Order from '../models/order.js'

dotenv.config();

import braintree from 'braintree'

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
})

//CURD controllers

//create
export const create = async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files);
    // res.json(req.fields);

    //destructuring of field values
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });

      case !description.trim():
        return res.json({ error: "Description is required" });

      case !price.trim():
        return res.json({ error: "Price is required" });

      case !category.trim():
        return res.json({ error: "Category is required" });

      // case quantity===0:
      // res.json({error : "This product need to be added urgently"});

      // case !shipping.trim() :
      // res.json({error : "Shipping is required"});

      case photo && photo.size > 1000000:
        return res.json({ error: "Image size should be less than 1 mb" });
    }

    const product = new Product({ ...req.fields, slug: slugify(name) });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    return res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(401).json(err);
  }
};

//update

export const update = async (req, res) => {
  try {
    //code

    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name.trim():
        res.json({ error: "Name is required" });

      case !description.trim():
        res.json({ error: "Description is required" });

      case !price.trim():
        res.json({ error: "Price is required" });

      case !category.trim():
        res.json({ error: "Category is required" });

      case !quantity.trim():
        res.json({ error: "Quantity is required" });

      case !shipping.trim():
        res.json({ error: "Shipping is required" });

      case photo && photo.size > 1000000:
        res.json({ error: "Image size should be less than 1 mb" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save(); // we need this again for update to save image if it occurs
    return res.json(product);

    // res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(401).json(err);
  }
};

//delete
export const remove = async (req, res) => {
  try {
    //Code

    const product = await Product.findByIdAndDelete(
      req.params.productId
    ).select("-photo");
    return res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(401).json(err);
  }
};

// get all data in list
export const list = async (req, res) => {
  try {
    //code
    const products = await Product.find({})
      .populate("category")
      .select("-photo")
      // .limit(12)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.log(err);
    return res.status(401).json(err);
  }
};

// //read
export const read = async (req, res) => {
  try {
    //
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    return res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(401).json(err);
  }
};

export const photo = async (req, res) => {
  try {
    //
    const product = await Product.findById(req.params.productId).select(
      "photo"
    );
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.send(product.photo.data);
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json(err);
  }
};

export const filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;

    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }; //greater than or equal to

    console.log("args => ", args);

    const products = await Product.find(args);

    // console.log("filtered:", products);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

//product count

export const productsCount = async (req, res) => {
  try {
    const count = await Product.find({}).estimatedDocumentCount();
    res.json(count);
  } catch (err) {
    console.log(err);
  }
};

export const listProducts = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await Product.find({})
      .select("-photo")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

//search by keyword api

export const productsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } }, //name
        { description: { $regex: keyword, $options: "i" } }, //description
      ],
    }).select("-photo");

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const relatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    const products = await Product.find({
      category: categoryId,
      _id: { $ne: productId },
    })
      .select("-photo")
      .populate("category")
      .limit(6);

    res.json(products);
    
  } catch (err) {
    console.log(err);
  }
};


//payment

export const getToken = async(req, res)=>{
  try{
    gateway.clientToken.generate({}, function (err, response){
      if(err){
        res.status(500).send(err);
      }else{
        res.send(response);
      }
    })
  }
  catch(err){
    console.log(err);
  }
}



export const processPayment = async(req, res)=>{
  try{


    const {nonce, cart} = req.body;
    let total = 0;
     cart.map((i)=>{
      total += i.price;

    })

    console.log(total)

    let newTransaction = gateway.transaction.sale(
      {

        //
        amount : total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },

    }, 
    function (error, result){
      if(result){
        const order = new Order({
          products : cart,
          payment : result,
          buyer : req.user._id
        }).save();

        //decrement quantity and increment sold
        decrementQuantity(cart);

        res.json({ok: true});
        // res.send(result);

      }
      else{
        res.status(500).send(error);
      }
    })

  }
  catch(err){
    console.log(err);
  }
}


const decrementQuantity = async(cart) =>{
  try{

    //build mongo db query
    const bulkOps = cart.map((item) => {
      return {
        updateOne :{
          filter: {_id:item._id},
          update: {$inc: {quantity:-0, sold:+1}},
        },
      }
    });

    const updated = await Product.bulkWrite(bulkOps, {});
    console.log("bulk Updated: ", updated)
  }
  catch(err){
    console.log(err)
  }
}