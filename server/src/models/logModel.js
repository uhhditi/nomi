import db from '../config/db.js';

//handles interactions with database
export const LogModel = {
    async getAll() {
        const result = await db.query(`SELECT * 
            FROM logs 
            ORDER BY created_at DESC`
        );
        return result.rows;
    },

    async create({description, notes, date, time, userId}) {
        console.log("in validate data");
        const result = await db.query(`
            INSERT INTO logs (description, notes, user_id, date, time)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`, 
            [description, notes, userId, date, time]
        );
        return result.rows[0];
    }
}