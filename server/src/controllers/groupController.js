import { GroupService } from "../services/groupService.js"

//handles requests - calls services
export const GroupController = {
    // async getAllLogs(req, res) {
    //     try {
    //         const logs = await LogService.getAllLogs();
    //         console.log(logs);
    //         res.status(200).json(logs);
    //     } catch (error) {
    //         res.status(500).send({message: error});
    //     }
        
    // },

    async createGroup(req, res){
        console.log("incoming log body:", req.body);
        try {
            const newGroup = await GroupService.createGroup(req.body);
            //TODO: CALL ADD GROUP MEMBER FLOW
            res.status(200).json(newGroup);
            
        } catch (error) {
            console.error("group creation error:", error);
            res.status(500).send({message: "internal server error"});
        }
    },

    // async editLog(req, res){
    //     console.log("incoming log body:", req.body);
    //     try {
    //         const editedLog = await LogService.editLog(req.body);
    //         res.status(200).json(editedLog);
    //         console.log(editedLog.meal);
            
    //     } catch (error) {
    //         console.error("log edit error:", error);
    //         res.status(500).send({message: "internal server error"});
    //     }
    // }
}