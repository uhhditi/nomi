import { SymptomService } from "../services/symptomService.js"

//handles requests - calls services
export const SymptomController = {
    async getAllSymptoms(req, res) {
        try {
            console.log("in get all symptoms")
            console.log(req.body.id);
            const id = await SymptomService.getAllSymptoms(req.body.id);
            console.log("id", id);
            res.status(200).json(id);
        } catch (error) {
            res.status(500).send({message: error.message});
        }
        
    },

    async createSymptom(req, res){
        console.log("incoming symptom body:", req.body);
        try {
            const newSymptom = await SymptomService.createSymptom(req.body);
            res.status(200).json(newSymptom);
            console.log(newSymptom);
            
        } catch (error) {
            console.error("symptom log creation error:", error);
            res.status(500).send({message: "internal server error"});
        }
    }
}