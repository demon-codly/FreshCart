import User from "../models/User.js"

// Update User CartData: /api/cart/update

export const updateCart = async (req, res)=>{
    try {
        // Get cartItems from the request body
        const {cartItems } = req.body;

        // Get the userId from the request object, set by the authUser middleware
        const userId = req.userId; 

        await User.findByIdAndUpdate (userId, {cartItems})
        res.json({ success: true, message: "Cart Updated" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}