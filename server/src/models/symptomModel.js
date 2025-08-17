import db from '../config/db.js';

//handles interactions with database
export const SymptomModel = {
    async create({name, date, time, userId}) {
        const result = await db.query(`
            INSERT INTO symptoms (name, date, time, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *`, 
            [name, date, time, userId]
        );
        return result.rows[0];
    }
}