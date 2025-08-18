// const productModel = require("../../models/productModel")
import productModel from '../../models/productModel.js'

const getCategoryWiseProduct = async(req,res)=>{
    try{
        const { category } = req?.body || req?.query
        const product = await productModel.find({ category })

        res.json({
            data : product,
            message : "Product",
            success : true,
            error : false
        })
    }catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

export default getCategoryWiseProduct