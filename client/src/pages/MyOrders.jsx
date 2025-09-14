// import React, {useState, useEffect} from 'react'
// import {useAppcontext} from '../context/AppContext'
// import {dummyOrders} from '../assets/assets'
// import {useLocation} from 'react-router-dom'
// const MyOrders = () => {
//     const [myOrders, setMyOrders] = useState([])
//     const {currency, axios, user, fetchUser} = useAppcontext()
//     const location = useLocation();


//     const fetchMyOrders = async () => {
//         try {
//             const { data } = await axios.get('api/order/user')
//             if(data.success){
//                 setMyOrders(data.orders)
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     useEffect(()=>{
//         if(user){
//             fetchMyOrders()  
//         }
        
//     },[user])

//     useEffect(() => {
//         const urlParams = new URLSearchParams(location.search);
//         if (urlParams.get("payment") === "success") {
//             // This will re-fetch the user data, which now includes an empty cart
//             // because the webhook cleared it in the database.
//             fetchUser();
//         }
//     }, [location.search, fetchUser]);


//   return (
//     <div className="mt-16 pb-16">
//         <div className="flex flex-col items-end w-max mb-8">
//             <p className="text-2xl font-medium uppercase">My Orders</p>
//             <div className="w-16 h-0.5 bg-primary rounded-full"></div>
//         </div>

//         {myOrders.map((order, index)=>(
//             <div key={index} className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl">
//                 <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col">
//                     <span>OrderId : {order._id}</span>
//                     <span>Payment : {order.paymentType}</span>
//                     <span>Total Amount : {currency}{order.amount}</span>
//                 </p>

//                 {order.items.map((item, index)=>(
//                     <div key={index} className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full maxx-w-4xl`}>
//                         <div className="flex items-center mb-4 md:mb-0"> 
//                             <div className="bg-primary/10 p-4 rounded-lg">
//                                 <img src={item.product.image[0]} alt="" className="w-16 h-16" />
//                             </div>
//                             <div className="ml-4">
//                                 <h2 className="text-xl font-medium text-gray-800">{item.product.name}</h2>
//                                 <p>Category : {item.product.category}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
//                             <p>Quantity: {item.quantity || "1"}</p>
//                             <p>Status: {item.status}</p>
//                             <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
//                         </div>

//                         <p className="text-primary text-lg font-medium">
//                             Amount: {currency}{item.product.offerPrice * item.quantity}
//                         </p>
//                     </div>
//                 ))}
//             </div>
//         ))}
      
//     </div>
//   )
// }

// export default MyOrders


import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppcontext } from '../context/AppContext';

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([]);
    const { currency, axios, user, fetchUser } = useAppcontext();
    const navigate = useNavigate();
    const location = useLocation();

    // Fetches the list of orders from your backend
    const fetchMyOrders = async () => {
        console.log("FRONTEND: 🟡 Calling fetchMyOrders()...");
        try {
            const { data } = await axios.get('api/order/user');
            console.log("FRONTEND: 🟢 API response for orders:", data); // Log the raw API response
            if (data.success) {
                setMyOrders(data.orders);
            } else {
                console.log("FRONTEND: 🔴 API reported failure fetching orders:", data.message);
            }
        } catch (error) {
            console.log("FRONTEND: 🔴 Network or server error fetching orders:", error);
        }
    };

    // This is the main logic block that runs when the component loads
    useEffect(() => {
        console.log("FRONTEND: 🟡 MyOrders useEffect triggered.");
        if (!user) {
            console.log("FRONTEND: 🔴 No user object found in context yet, waiting.");
            return; // If user data isn't loaded yet, do nothing
        }
        console.log("FRONTEND: 🟢 User object found in context. Proceeding.");

        const urlParams = new URLSearchParams(location.search);
        
        // Check if we arrived here from a successful payment
        if (urlParams.get("payment") === "success") {
            console.log("FRONTEND: 🟢 Detected '?payment=success' in URL. Starting verification process.");
            
            // This delay is to give the backend Stripe webhook time to process.
            const timer = setTimeout(() => {
                console.log("FRONTEND: 🟡 3-second delay finished. Fetching fresh data now...");
                fetchUser();      // This should refresh user data and clear the cart in the UI
                fetchMyOrders();  // This should fetch the updated list of orders
                
                // Important: Clean the URL so this logic doesn't run again on a simple page refresh
                navigate('/my-orders', { replace: true }); 
            }, 3000);

            // Cleanup function if the user navigates away before the timer finishes
            return () => clearTimeout(timer);
        } else {
            // If this is just a normal visit to the page (no ?payment=success), fetch orders immediately
            console.log("FRONTEND: 🟢 Normal page visit. Fetching orders directly.");
            fetchMyOrders();
        }
    }, [user, location, navigate, fetchUser]); // Dependencies for the effect

    return (
        <div className="mt-16 pb-16">
            <div className="flex flex-col items-end w-max mb-8">
                <p className="text-2xl font-medium uppercase">My Orders</p>
                <div className="w-16 h-0.5 bg-primary rounded-full"></div>
            </div>
            {myOrders.length > 0 ? (
                myOrders.map((order) => (
                    <div key={order._id} className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl">
                        <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col">
                            <span>OrderId : {order._id}</span>
                            <span>Payment : {order.paymentType}</span>
                            <span>Total Amount : {currency}{order.amount}</span>
                        </p>
                        {order.items.map((item, index) => (
                            <div key={index} className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full`}>
                                <div className="flex items-center mb-4 md:mb-0">
                                    <div className="bg-primary/10 p-4 rounded-lg">
                                        <img src={item.product.image[0]} alt={item.product.name} className="w-16 h-16 object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-xl font-medium text-gray-800">{item.product.name}</h2>
                                        <p>Category : {item.product.category}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                                    <p>Quantity: {item.quantity || "1"}</p>
                                    <p>Status: {order.status}</p>
                                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className="text-primary text-lg font-medium">
                                    Amount: {currency}{item.product.offerPrice * item.quantity}
                                </p>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <p>You have no orders yet. Please place an order to see it here.</p>
            )}
        </div>
    );
};

export default MyOrders;


