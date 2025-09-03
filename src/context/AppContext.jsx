import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext(null);

export const AppContextProvider = ({children}) => {
    //
    const navigate = useNavigate();
    const [user, setUser] = useState(true);
    const [isSeller, setisSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);

    const value={navigate, user, setUser, setisSeller, isSeller, showUserLogin, setShowUserLogin}; // all the values that you want to share across the app


    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppcontext =()=>{
    return useContext(AppContext);
}