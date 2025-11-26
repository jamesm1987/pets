import { Request, Response, NextFunction } from 'express';
import { z} from 'zod';
import { petQueries } from '../db/queries/petQueries';
import { create } from 'domain';

const createPetSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    animal_type: z.string().min(1, 'Animal type is required').max(100, 'Animal type is too long'),
    owner_name: z.string().min(1, 'Owner name is required').max(255, 'Owner name is too long'),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid format. Use YYYY-MM-DD'),
});

const updatePetSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
    animal_type: z.string().min(1, 'Animal type is required').max(100, 'Animal type is too long').optional(),
    owner_name: z.string().min(1, 'Owner name is required').max(255, 'Owner name is too long').optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid format. Use YYYY-MM-DD').optional(),
});

export const getAllPets = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { search, animal_type } = req.query;
        const filters = {
            search: search as string | undefined,
            animal_type: animal_type as string | undefined,
        };
        const pets = await petQueries.getAll(filters);
        res.json(pets);
    } catch (error) {
        next(error);
    }
};

export const getPetById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const petId = parseInt(req.params.id, 10);
        const pet = await petQueries.getById(petId);
        
        if (!pet) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }
        res.json(pet);
    } catch (error) {
        next(error);
    }
};

export const createPet = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, animal_type, owner_name, date_of_birth } = req.body;
        const validationResult = createPetSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            const { error } = validationResult;
            res.status(400).json({ 
                error: 'Validation failed',
                details: error.errors
            });
            return;
        }

        const exists = await petQueries.exists(name, owner_name);
        
        if (exists) {
            res.status(409).json({ message: 'Pet already exists' });
            return;
        }

        const pet = await petQueries.create({
            name,
            animal_type,
            owner_name,
            date_of_birth,
        });
        
        res.status(201).json(pet);
    } catch (error) {
        next(error);
    }
};

export const updatePet = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const petId = parseInt(req.params.id, 10);
        const { name, animal_type, owner_name, date_of_birth } = req.body;

        const existingPet = await petQueries.getById(petId);

        if (!existingPet) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }

        const validationResult = updatePetSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            res.status(400).json({ 
                error: 'Validation failed',
                details: validationResult.error.errors
            });
            return;
        }

        const pet = await petQueries.update(petId, {
            name,
            animal_type,
            owner_name,
            date_of_birth,
        });

        res.json(pet);
    } catch (error) {
        next(error);
    }
};

export const deletePet = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const petId = parseInt(req.params.id, 10);
        const pet = await petQueries.getById(petId);

        if (!pet) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }

        await petQueries.delete(petId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

