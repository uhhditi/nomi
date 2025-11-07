import db from '../config/db.js';

//handles interactions with database
export const GroupModel = {
    // async getAll() {
    //     const result = await db.query(`SELECT * 
    //         FROM logs 
    //         ORDER BY created_at DESC`
    //     );
    //     return result.rows;
    // },

    async create({name, userIds}) {
        const result = await db.query(`
            INSERT INTO groups (name, user_ids)
            VALUES ($1, $2)
            RETURNING *`, 
            [name, userIds]
        );
        return result.rows[0];
    },

    // async edit({description, notes, date, time, userId, id}) {
    //     console.log("in validate data");
    //     const result = await db.query(`
    //         UPDATE logs
    //         SET description = $1, notes = $2, user_id = $3, date = $4, time = $5
    //         WHERE user_id = $3 AND id = $6
    //         RETURNING *`, 
    //         [description, notes, userId, date, time, id]
    //     );
    //     return result.rows[0];
    // }
}