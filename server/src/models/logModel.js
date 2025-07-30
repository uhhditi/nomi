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

    async create({meal, symptom, notes, userId}) {
        const result = await db.query(`
            INSERT INTO logs (meal, symptom, notes, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`, 
            [meal, symptom, notes, userId]
        );
        return result.rows[0];
    }
}