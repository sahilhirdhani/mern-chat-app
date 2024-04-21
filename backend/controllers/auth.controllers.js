import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async(req,res) => {
    try {
        //console.log("Request Body:", req.body);

        const {fullName, username, password, confirmPassword, gender} = req.body;
        
        if (!username || username.trim() === "") {
            return res.status(400).json({ error: "Username is required" });
        }

        if (!fullName) {
            return res.status(400).json({ error: "Full name is required" });
        }
        if (!confirmPassword) {
            return res.status(400).json({ error: "confirmPassword is required" });
        }
        if (!password) {
            return res.status(400).json({ error: "password is required" });
        }
        if (!gender) {
            return res.status(400).json({ error: "gender is required" });
        }

        if(password!==confirmPassword){
            return res.status(400).json({error:"Passwords don't match"});
        }

        const user = await User.findOne({username});
        if(user){
            return res.status(400).json({error:"User already exists"});
        }

        // HASH PASSWORD
        // const hashedPassword = await bcrypt.hash(password,10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);


        // https://avatar.iran.liara.run/public/boy
        const boyProfilePic=`https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic=`https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
            fullName,
            username,
            password:hashedPassword,
            gender,
            profilePic:gender==="male"?boyProfilePic:girlProfilePic,
        });

        if(newUser){
            // Generate JWT token here
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();
            //res.status(200).json({message:"User created successfully"});
            res.status(201).json({
                _id_:newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic: newUser.profilePic,
            });
            console.log("User SignUp compelete");
        }
        else{
            res.status(400).json({error:"invalid user data"});
        }
        
        
    } catch (error) {
        console.log("error in signup controller", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const login = async (req,res) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid username or password"});
        }
        generateTokenAndSetCookie(user._id,res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
        });

    } catch (error){
        console.log("error in login controller", error.message);
        res.status(500).json({error:"Internal server error"});
    }
    
    console.log("Login User");
}

export const logout = (req,res) => {
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logout successful"});
    } catch (error){
        console.log("error in logout controller", error.message);
        res.status(500).json({error:"Internal server error"});
    }
    console.log("Logout User");
}