import { LogModel } from '../models/logModel.js'

//handles logic
export const LogService = {
    async getAllLogs() {
        return LogModel.getAll();
    },

    async createLog(newLog) {
        const {meal, symptom, notes, userId} = newLog;
        const createdLog = await LogModel.create({ meal, symptom, notes, userId });
        return createdLog;
    }
 }