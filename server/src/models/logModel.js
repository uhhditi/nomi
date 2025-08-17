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
    },

    async edit({description, notes, date, time, userId, id}) {
        console.log("in validate data");
        const result = await db.query(`
            UPDATE logs
            SET description = $1, notes = $2, user_id = $3, date = $4, time = $5
            WHERE user_id = $3 AND id = $6
            RETURNING *`, 
            [description, notes, userId, date, time, id]
        );
        return result.rows[0];
    }
}