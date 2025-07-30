import { UserService } from "../services/userService.js"

//handles requests - calls services
export const UserController = {
    async createUser(req, res){
        console.log("incoming user body:", req.body);
        try {
            const newUser = await UserService.createUser(req.body);
            res.status(200).json(newUser);
            
        } catch (error) {
            console.error("user creation error:", error);
            res.status(500).send({message: "internal server error"});
        }
    },

    async loginUser(req, res){
        console.log("incoming user body:", req.body);
        try {
            const newLogin = await UserService.loginUser(req.body);
            res.status(200).json(newLogin);
            
        } catch (error) {
            console.error("user login error:", error);
            res.status(500).send({message: "internal server error"});
        }
    }
}