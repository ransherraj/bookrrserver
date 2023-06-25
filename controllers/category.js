import Category from '../models/category.js';
import slugify from 'slugify';
import Product from "../models/product.js";


//CURD controllers

//create
export const create = async (req, res) => {
    try{

        const {name} = req.body;
        if(!name.trim()){
            return res.json({error : 'Name is required'});
        }

        const existingCategory = await Category.findOne({name});
        if(existingCategory){
            return res.json({error : 'Category already exists'});
        }

        const category = await new Category({name , slug : slugify(name)}).save();
        return res.json(category);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}


//update

export const update = async (req, res) => {
    try{

        //
        const {name} = req.body;
        const {categoryId} = req.params;
        const category = await Category.findByIdAndUpdate(categoryId, {
            name,
            slug: slugify(name)
        },
        {
            new: true,
        }
        );
        res.json(category);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}

//delete
export const remove = async (req, res) => {
    try{

        //

        const removed = await Category.findByIdAndDelete(req.params.categoryId);
        res.json(removed);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}

// get all data in list
export const list = async (req, res) => {
    try{

        //
        const all = await Category.find({});
        res.json(all);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}


//user categories

// get all data in list
export const userCategories = async (req, res) => {
    try{

        //
        const all = await Category.find({});
        res.json(all);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}



//read
export const read = async (req, res) => {
    try{

        //
        const category = await Category.findOne({slug: req.params.slug});
        res.json(category);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}


export const productsByCategory = async (req, res) => {
    try{

        //
        const category = await Category.findOne({slug: req.params.slug});
        const products = await Product.find({category}).populate('category');
        res.json({
            category,
            products,
        });

    }
    catch(err){
        console.log(err);
    }
}