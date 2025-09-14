import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from '../models/User.js';
import stripe from "stripe"

// Place Order COD: /api/order/cod
export const placeOrderCOD =  async (req, res)=> {
    try {
        const {items, address } = req.body;
        const userId = req.userId
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }
        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
             const product = await Product.findById(item.product);
             return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        //add tax charge 2%

        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

    
        await User.findByIdAndUpdate(userId, {cartItems: {}})
        return res.json({ success: true, message: "Order placed successfully" })

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Place Order Stripe: /api/order/stripe
export const placeOrderStripe =  async (req, res)=> {
    try {
        const {items, address } = req.body;
        const userId = req.userId
        const {origin} = req.headers;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        let productData = [];

        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
             const product = await Product.findById(item.product);
             productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
             })
             return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        //add tax charge 2%

        amount += Math.floor(amount * 0.02);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        });

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // Create line items for Stripe
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data:{
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity,
            }
        });

        // Create the checkout session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/my-orders?payment=success`, // A simpler success URL
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(), // Use the ID from the order we just created
                userId,
            }
        });


        return res.json({ success: true, url: session.url})

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message});
    }
}


//Stripe webhooks to verify payment action: /stripe
// export const stripeWebhooks = async (request, response) => {
//     //stripe gateway initialized
//     const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

//     const sig = request.header["stripe-signature"];

//     let event;

//     try {
//         event = stripeInstance.webhooks.constructEvent(
//             request.body,
//             sig,
//             process.env.STRIPR_WEBHOOK_SECRET
//         );
//     } catch (error) {
//         response.status(400).send(`webhook error: ${error.message}`)
//     }

//     //handle the event
//     switch (event.type) {
//         case "payment_intent.succeeded" : {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             //getting session metadata
//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId
//             });

//             const { orderId, userId } = session.data[0].metadata;
//             //mark payment as paid
//             await Order.findByIdAndUpdate(orderId, {isPaid: true})
//             //clear user cart
//             await User.findByIdAndUpdate(userId, {cartItems: {}});

//             break;
//         }

//         case "payment_intent.payment_failed" : {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             //getting session metadata
//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId
//             });

//             const { orderId } = session.data[0].metadata;
//             await Order.findByIdAndUpdate(orderId);
//             break;

//         }

//         default:
//             console.error(`Unhandled event type ${event.type}`)
//             break;
//     }
//     response.json({received: true})
// }
// export const stripeWebhooks = async (request, response) => {
//     console.log("\n--- Stripe Webhook Received ---");
//     // Initialize Stripe inside the function or at the top of the file
//     const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    
//     // The raw request body is needed to verify the signature
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = stripeInstance.webhooks.constructEvent(
//             request.body,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET // FIX: Corrected typo from STRIPR
//         );
//         console.log("✅ Webhook signature verified.");
//     } catch (error) {
//         console.log(`❌ Webhook Error: ${error.message}`);
//         return response.status(400).send(`Webhook Error: ${error.message}`);
//     }

//     // Handle the checkout.session.completed event
//     if (event.type === 'checkout.session.completed') {
//         const session = event.data.object;
//         const orderId = session.metadata.orderId;
//         const userId = session.metadata.userId;


//         console.log(`Event: checkout.session.completed`);
//         console.log(`Metadata received -> Order ID: ${orderId}, User ID: ${userId}`);


//         // Find the order in your database
//         const order = await Order.findById(orderId);
//         if (order) {
//             // Mark the order as paid
//             order.isPaid = true;
//             await order.save();
            
//             // Clear the user's cart from the database
//             await User.findByIdAndUpdate(userId, { cartItems: {} });
//         }
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.json({ received: true });
// };

export const stripeWebhooks = async (request, response) => {
    console.log("\n--- Stripe Webhook Received ---"); // Log when the endpoint is hit

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("✅ Webhook signature verified.");
    } catch (error) {
        console.log(`❌ Webhook Error: ${error.message}`);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        console.log(`Event: checkout.session.completed`);
        console.log(`Metadata received -> Order ID: ${orderId}, User ID: ${userId}`);

        if (!orderId || !userId) {
            console.log("❌ CRITICAL: orderId or userId missing from webhook metadata!");
            return response.json({ received: true });
        }

        try {
            // Mark the order as paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true });
            console.log(`✅ DATABASE: Marked order ${orderId} as paid.`);
            
            // Clear the user's cart from the database
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            console.log(`✅ DATABASE: Cleared cart for user ${userId}.`);

        } catch (dbError) {
            console.log(`❌ DATABASE ERROR during webhook processing: ${dbError.message}`);
        }
    } else {
        console.log(`- Received unhandled event type: ${event.type}`);
    }
    
    response.json({ received: true });
};


// Get Orders by User ID: /api/order/user
export const getUserOrders = async (req, res)=> {
    try {
        const userId = req.userId;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// get all orders ( for seller/admin) : /api/order/seller
export const getAllOrders = async (req, res)=> {
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
