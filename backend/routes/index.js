import { Router } from 'express';
const router = Router();

// const userSignUpController = require("../controller/user/userSignUp")
// const userSignInController = require('../controller/user/userSignIn')
// const userDetailsController = require('../controller/user/userDetails')
// const authToken = require('../middleware/authToken')
// const userLogout = require('../controller/user/userLogout')
// const allUsers = require('../controller/user/allUsers')
// const updateUser = require('../controller/user/updateUser')
// const UploadProductController = require('../controller/product/uploadProduct')
// const getProductController = require('../controller/product/getProduct')
// const updateProductController = require('../controller/product/updateProduct')
// const getCategoryProduct = require('../controller/product/getCategoryProductOne')
// const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct')
// const getProductDetails = require('../controller/product/getProductDetails')
// const addToCartController = require('../controller/user/addToCartController')
// const countAddToCartProduct = require('../controller/user/countAddToCartProduct')
// const addToCartViewProduct  = require('../controller/user/addToCartViewProduct')
// const updateAddToCartProduct = require('../controller/user/updateAddToCartProduct')
// const deleteAddToCartProduct = require('../controller/user/deleteAddToCartProduct')
// const searchProduct = require('../controller/product/searchProduct')
// const filterProductController = require('../controller/product/filterProduct')
import userSignUpController from '../controller/user/userSignUp.js';
import userSignInController from '../controller/user/userSignIn.js';
import userDetailsController from '../controller/user/userDetails.js';
import authToken from '../middleware/authToken.js';
import userLogout from '../controller/user/userLogout.js';
import allUsers from '../controller/user/allUsers.js';
import updateUser from '../controller/user/updateUser.js';
import UploadProductController from '../controller/product/uploadProduct.js';
import getProductController from '../controller/product/getProduct.js';
import updateProductController from '../controller/product/updateProduct.js';
import getCategoryProduct from '../controller/product/getCategoryProductOne.js';
import getCategoryWiseProduct from '../controller/product/getCategoryWiseProduct.js';
import getProductDetails from '../controller/product/getProductDetails.js';
import addToCartController from '../controller/user/addToCartController.js';
import countAddToCartProduct from '../controller/user/countAddToCartProduct.js';
import addToCartViewProduct from '../controller/user/addToCartViewProduct.js';
import updateAddToCartProduct from '../controller/user/updateAddToCartProduct.js';
import deleteAddToCartProduct from '../controller/user/deleteAddToCartProduct.js';
import searchProduct from '../controller/product/searchProduct.js';
import filterProductController from '../controller/product/filterProduct.js';



router.post("/signup",userSignUpController)
router.post("/signin",authToken, userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)

//admin panel 
router.get("/all-user",authToken,allUsers)
router.post("/update-user",authToken,updateUser)

//product
router.post("/upload-product",authToken,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,updateProductController)
router.get("/get-categoryProduct",getCategoryProduct)
router.post("/category-product",getCategoryWiseProduct)
router.post("/product-details",getProductDetails)
router.get("/search",searchProduct)
router.post("/filter-product",filterProductController)

//user add to cart
router.post("/addtocart",authToken,addToCartController)
router.get("/countAddToCartProduct",authToken,countAddToCartProduct)
router.get("/view-card-product",authToken,addToCartViewProduct)
router.post("/update-cart-product",authToken,updateAddToCartProduct)
router.post("/delete-cart-product",authToken,deleteAddToCartProduct)







export default router;