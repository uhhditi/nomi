import { LogModel } from '../models/logModel.js'

//handles logic
export const LogService = {
    async getAllLogs() {
        return LogModel.getAll();
    },

    async createLog(newLog) {
        const {description, notes, date, time, userId} = newLog;
        const createdLog = await LogModel.create({ description, notes, date, time, userId });
        return createdLog;
    }
 }