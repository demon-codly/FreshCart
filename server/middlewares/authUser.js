// import jwt from 'jsonwebtoken';

// const authUser = async (req, res, next) => {
//     const {token} = req.cookies;
    
//     if(!token){
//         return res.json({ sccess: false, message: 'Not Authorized'});
//     }

//     try {
//         const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
//         if(tokenDecode.id){
//             req.userId = tokenDecode.id;
//         } else{
//             return res.json({success: false, message: 'Not Authorized'});
//         }
//         next();

//     } catch (error) {
//         res.json({success: false, message: error.message});
//     }
// }


import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const { token } = req.cookies; // ✅ requires cookie-parser middleware

    if (!token) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    // ✅ verify and decode token
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode?.id) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    req.userId = tokenDecode.id; // ✅ attach userId safely
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default authUser;