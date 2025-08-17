import { SymptomService } from "../services/symptomService.js"

//handles requests - calls services
export const SymptomController = {
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