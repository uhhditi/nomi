import { UserModel } from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
const saltRounds = 10;

//handles logic
export const UserService = {
    async createUser(newUser) {
        const {name, email, password} = newUser;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const createdUser = await UserModel.create({ name, email, hashed_password:hashedPassword });

        const accessToken = jwt.sign({ userId: createdUser.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: createdUser.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        return { accessToken: accessToken, refreshToken: refreshToken, user: createdUser }; 
    },
    async loginUser(email, password){
        //return token !!!
        const user = await UserModel.findByEmail(email);
        if(!user){
            return null;
        }
        const validPassword = await bcrypt.compare(password, user.hashed_password);
        if(!validPassword){
            return null;
        }
        else{
            const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            console.log("password worked")
            return { accessToken: accessToken, refreshToken: refreshToken, user: user };
        }
    }
}

export const refreshToken = (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
      //res.json({ accessToken });
      return accessToken;
    } catch (error) {
      res.status(401).json({ error: "Invalid refresh token" });
    }
  };