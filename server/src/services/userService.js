import { UserModel } from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
const saltRounds = 10;

//handles logic
export const UserService = {
    async createUser(newUser) {
        const { email, password, first, last } = newUser;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("hashed pass", hashedPassword)
        const createdUser = await UserModel.create({ email, password:hashedPassword, first, last});

        const accessToken = jwt.sign({ userId: createdUser.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: createdUser.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        console.log(createdUser);
        console.log("access token: " + accessToken);
        console.log("refresh token: " + refreshToken);
        return { accessToken: accessToken, refreshToken: refreshToken, user: createdUser }; 
    },
    async loginUser(email, password){
        //return token !!!
        const user = await UserModel.findByEmail(email);
        if(!user){
            return null;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            return null;
        }
        else{
            const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
            console.log("access token: " + accessToken);
            console.log("refresh token: " + refreshToken);
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