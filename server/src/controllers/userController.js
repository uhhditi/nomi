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
            res.status(500).send({message: "internal server error", errorCode: error.code});
        }
    },

    async loginUser(req, res){
        console.log("in backend")
        console.log("incoming user body:", req.body);
        try {
            const newLogin = await UserService.loginUser(req.body.email, req.body.password);
            if (!newLogin) {
                // Login failed (user not found or password invalid)
                return res.status(401).json({ success: false, message: "Invalid credentials" });
              }
          
              // Send success response
              return res.status(200).json({ success: true, user: newLogin });
            
        } catch (error) {
            console.error("user login error:", error);
            res.status(500).send({message: "internal server error"});
        }
    },

    async updateProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });
            const { first, last, email } = req.body;
            const updatedUser = await UserService.updateUser(userId, { first, last, email });
            res.json(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: error.message || 'Failed to update profile' });
        }
    },

    //refresh token function
    async refreshToken(req, res){
        const { refreshToken } = req.body;
        try {
            if (!refreshToken) {
                return res.status(401).json({ error: "Refresh token required" });
              }

              try {
                const accessToken = await UserService.refreshToken(refreshToken);
                if (!accessToken) {
                    // Login failed (user not found or password invalid)
                    return res.status(401).json({ success: false, message: "Invalid token" });
                  }
    
                  // Send success response
                  return res.status(200).json({ accessToken });
                
            } catch (error) {
                console.error("user login error:", error);
                res.status(500).send({message: "internal server error"});
            }
        } catch (error) {
            console.error("refresh token error:", error);
            res.status(500).send({message: "internal server error"});
        }
        
        
    }
}