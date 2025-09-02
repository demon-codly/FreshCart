import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext(null);

export const AppContextProvider = ({children}) => {
    //
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setisSeller] = useState(false);

    const value={navigate, user, setUser, setisSeller, isSeller}; // all the values that you want to share across the app


    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppcontext =()=>{
    return useContext(AppContext);
}