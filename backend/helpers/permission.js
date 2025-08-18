// const userModel = require("../models/userModel") 
import userModel from '../models/userModel.js'


const uploadProductPermission = async(userId) => {
    const user = await userModel.findById(userId)

    if(user.role === 'ADMIN'){
        return true
    }

    return false
}


export default uploadProductPermission