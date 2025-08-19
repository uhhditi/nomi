import { SymptomModel } from '../models/symptomModel.js'

//handles logic
export const SymptomService = {
    async getAllSymptoms() {
        return SymptomModel.getAll();
    },
    
    async createSymptom(newSymptom) {
        const {name, date, time, userId} = newSymptom;
        const createdSymptom = await SymptomModel.create({ name, date, time, userId });
        return createdSymptom;
    }
 }