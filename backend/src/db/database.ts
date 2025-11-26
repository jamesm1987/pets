import { Pool } from 'pg';
import { config } from '../config/config';

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

export const connect = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        console.log('Connected to the database successfully.');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;    
    }
};

export const initializeSchemas = async (): Promise<boolean> => {
    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS pets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                animal_type VARCHAR(100) NOT NULL,
                owner_name VARCHAR(255) NOT NULL,
                date_of_birth DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS medical_records (
                id SERIAL PRIMARY KEY,
                pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
                record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('vaccine', 'allergy')),
                name VARCHAR(255) NOT NULL,
                date DATE,
                reactions TEXT,
                severity VARCHAR(20) CHECK (severity IN ('mild', 'severe')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
            CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(record_type);
            CREATE INDEX IF NOT EXISTS idx_pets_animal_type ON pets(animal_type);
            CREATE INDEX IF NOT EXISTS idx_pets_name ON pets(name);
        `);
        
        console.log('Database schemas initialized');
        return true;

    } catch (error) {
        console.error('Error initializing database schemas:', error);
        throw error;
    }
};

export const query = async <T = any> (
    text: string,
    params?: any[]
): Promise<any> => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error: any) {
        console.error('Query error:', error);
        throw error;
    }
};