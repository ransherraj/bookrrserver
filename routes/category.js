import express from 'express';
const router =  express.Router();

//controllers
import {create, update, remove, list, read, userCategories, productsByCategory} from '../controllers/category.js';

//middilewares
import {requireSignin, isAdmin} from '../middlewares/auth.js';


router.post('/category', requireSignin, isAdmin, create);
router.put('/category/:categoryId', requireSignin, isAdmin, update);
router.delete('/category/:categoryId', requireSignin, isAdmin, remove); //cannot use delete keyword as it is reserveved
// router.get('/categories', requireSignin, isAdmin, list);
router.get('/categories', list);
router.get('/user-categories', userCategories);
router.get('/category/:slug', read);
router.get('/products-by-category/:slug', productsByCategory);

export default router;