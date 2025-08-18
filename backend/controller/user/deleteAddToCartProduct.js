// const addToCartModel = require("../../models/cartProduct")
import addToCartModel from '../../models/cartProduct.js'

const deleteAddToCartProduct = async(req,res)=>{
    try{
        const currentUserId = req.userId 
        const addToCartProductId = req.body._id

        const deleteProduct = await addToCartModel.deleteOne({ _id : addToCartProductId})

        res.json({
            message : "Product Deleted From Cart",
            error : false,
            success : true,
            data : deleteProduct
        })

    }catch(err){
        res.json({
            message : err?.message || err,
            error : true,
            success : false
        })
    }
}

export default deleteAddToCartProduct