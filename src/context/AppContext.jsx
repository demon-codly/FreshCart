import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const currency = import.meta.VITE_CURRENCY;
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setisSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);

    const [cartItems, setCartItems] = useState({})

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
        cartData[itemId] = quantity;
        setCartItems(cartData)
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


    useEffect(()=>{
        fetchProducts()
    },[])

    const value = {navigate, user, setUser, setisSeller, isSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems
    }
    // all the values that you want to share across the app


    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppcontext = ()=>{
    return useContext(AppContext);
}