import { UserModel } from '../models/userModel.js'
import bcrypt from 'bcrypt'
const saltRounds = 10;

//handles logic
export const UserService = {
    async createUser(newUser) {
        const {name, email, password} = newUser;
        const hashedPassword = bcrypt.hash(password, saltRounds);
        const createdUser = await UserModel.create({ name, email, password:hashedPassword });
        return createdUser;
    },
    async loginUser(email, password){
        const user = UserModel.findByEmail(email);
        if(!user){
            return null;
        }
        const validPassword = bcrypt.compare(password, user.hashedPassword);
        if(!validPassword){
            return null;
        }
        else{
            console.log("password worked")
        }
    }
 }