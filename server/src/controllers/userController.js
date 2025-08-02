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
            const newLogin = await UserService.loginUser(req.body.email, req.body.password);
            if (!newLogin) {
                // Login failed (user not found or password invalid)
                return res.status(401).json({ success: false, message: "Invalid credentials" });
              }

              const userData = {
                name: newLogin.name,
                email: newLogin.email,
                // any other non-sensitive fields you want to include
              };
          
              // Send success response
              return res.status(200).json({ success: true, user: userData });
            
        } catch (error) {
            console.error("user login error:", error);
            res.status(500).send({message: "internal server error"});
        }
    }
}