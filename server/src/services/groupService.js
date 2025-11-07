import { GroupModel } from '../models/groupModel.js'

//handles logic
export const GroupService = {
    async createGroup(newGroup) {
        const {name, userIds} = newGroup;
        const createdGroup = await GroupModel.create({name, userIds});
        return createdGroup;
    },

    // async editLog(editedLog) {
    //     const {description, notes, date, time, userId, id} = editedLog;
    //     const updatedLog = await LogModel.edit({ description, notes, date, time, userId, id });
    //     return updatedLog;
    // }
 }