import db from '../config/db.js';

//handles interactions with database
export const SymptomModel = {
    async getAll() {
        const result = await db.query(`SELECT * 
            FROM symptoms 
            ORDER BY id DESC`
        );
        return result.rows;
    },
    async create({name, date, time, userId}) {
        const result = await db.query(`
            INSERT INTO symptoms (name, date, time, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`, 
            [name, date, time, userId]
        );
        return result.rows[0];
    },

    async getAll( userId ) {
        const result = await db.query(`
            SELECT * 
            FROM symptoms 
            WHERE user_id = $1`,
            [userId]
        );
        return result.rows;
    },
}