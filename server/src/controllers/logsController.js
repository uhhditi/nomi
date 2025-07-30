import { LogService } from "../services/logService.js"

//handles requests - calls services
export const LogsController = {
    async getAllLogs(req, res) {
        try {
            const logs = await LogService.getAllLogs();
            console.log(logs);
            res.status(200).json(logs);
        } catch (error) {
            res.status(500).send({message: "internal server error"});
        }
        
    },

    async createLog(req, res){
        console.log("incoming log body:", req.body);
        try {
            const newLog = await LogService.createLog(req.body);
            res.status(200).json(newLog);
            console.log(newLog.meal);
            
        } catch (error) {
            console.error("log creation error:", error);
            res.status(500).send({message: "internal server error"});
        }
    }
}