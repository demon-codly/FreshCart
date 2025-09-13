import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { toast } from "react-hot-toast";
import axios from 'axios';

// eslint-disable-next-line react-refresh/only-export-components
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);

    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({})

    //fetch seller status
    const fetechSeller = async () => {
        try {
            const {data} = await axios.get('api/seller/is-auth');
            if(data.success){
                setIsSeller(true)
            } else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }

    //fetch products from backend
    const fetchProducts = async()=>{
        setProducts(dummyProducts)
    }

    //add product to cart
    const addToCart = (itemId)=>{
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId] += 1;
        } else{
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to cart")
    }

    // Update Cart Item Quantity
    const updateCartItem = (itemId, quantity)=>{
        let CartData = structuredClone(cartItems);
        CartData[itemId] = quantity;
        setCartItems(CartData)
        toast.success("Cart Updated")
    }

    // Remove Product from Cart
    const removeFromCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] == 0) {
                delete cartData[itemId];
            }
        }
        toast.success("Removed from cart")
        setCartItems(cartData);
    }

    // get cart item count
    const getCartCount = ()=>{
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item];
        }
        return totalCount;
    }

    // Get cart total amount
    const getCartAmount = ()=>{
        let totalAmount = 0;
        for (const items in cartItems){
            let itemInfo = products.find((product)=> product._id === items);
            if(cartItems[items] > 0){
                totalAmount += itemInfo.offerPrice * cartItems[items]
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(()=>{
        fetechSeller()
        fetchProducts()
    },[])

    const value = {navigate, user, setUser, setIsSeller, isSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios
    }
    // all the values that you want to share across the app


    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppcontext = ()=>{
    return useContext(AppContext);
}