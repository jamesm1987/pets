import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { recordQueries } from '../db/queries/recordQueries';
import { petQueries } from '../db/queries/petQueries';

const createRecordSchema = z.object({
    record_type: z.enum(['vaccine', 'allergy'], {
        errorMap: () => ({ message: "Record type must be either 'vaccine' or 'allergy'" }),
    }),
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid format. Use YYYY-MM-DD').optional(),
    reactions: z.string().optional(),
    severity: z.enum(['mild', 'severe']).optional(),
    }).refine((data) => {
        if (data.record_type === 'vaccine' && !data.date) {
            return false;
        }
        return true;
    }, {
        message: "Vaccine records require a date",
        path: ['date'],
}).refine((data) => {
    if (data.record_type === 'allergy' && data.reactions && !data.severity) {
        return false;
    }
    return true;
}, {
    message: "Allergy records with reactions require severity (mild or severe)",
    path: ['severity'],
});

export const updateRecordSchema = z.object({
    recordtype: z.enum(['vaccine', 'allergy']).optional(),
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid format. Use YYYY-MM-DD').optional(),
    reactions: z.string().optional(),
    severity: z.enum(['mild', 'severe']).optional(),
});

export const getRecordsByPetId = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const petId = parseInt(req.params.petId, 10);
        const pet = await petQueries.getById(petId);

        if (!pet) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }

        const records = await recordQueries.getByPetId(petId);
        res.json(records);
    } catch (error) {
        next(error);
    }
};

export const getRecordById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const recordId = parseInt(id, 10);

    const record = await recordQueries.getById(recordId);
    
    if (!record) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    res.json(record);
  } catch (err) {
    next(err);
  }
};

export const searchVaccineNames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    
    if (!search || search.trim().length === 0) {
      res.json([]);
      return;
    }

    if (search.trim().length < 2) {
      res.json([]);
      return;
    }

    const vaccineNames = await recordQueries.getByName({ search: search.trim() });
    res.json(vaccineNames);
  } catch (err) {
    next(err);
  }
};

export const createRecord = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const petId = parseInt(req.params.petId, 10);
        const { record_type, name, date, reactions, severity } = req.body;
        
        const validatedData = createRecordSchema.safeParse(req.body);

        if (!validatedData.success) {
            res.status(400).json({ 
                errors: 'Validation Failed',
                details: validatedData.error.errors 
            });
            return;
        }

        const pet = await recordQueries.getById(petId);

        if (!pet) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }

        const record = await recordQueries.create({
            pet_id: petId,
            record_type,
            name,
            date,
            reactions: reactions || null,
            severity: severity || null,
        });

        res.status(201).json(record);
    } catch (error) {
        next(error);
    }
};

export const updateRecord = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recordId = parseInt(req.params.id, 10);
        const { record_type, name, date, reactions, severity } = req.body;

        const existingRecord = await recordQueries.getById(recordId);

        if (!existingRecord) {
            res.status(404).json({ message: 'Medical record not found' });
            return;
        }

        const validationResult = updateRecordSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            res.status(400).json({ 
                error: 'Validation failed',
                details: validationResult.error.errors
            });
            return;
        }

        const finalRecordType = record_type || existingRecord.record_type;
        const finalName = name !== undefined ? name : existingRecord.name;
        const finalDate = date !== undefined ? (date === "" ? null : date) : existingRecord.date;
        const finalReactions = reactions !== undefined ? reactions : existingRecord.reactions;
        const finalSeverity = severity !== undefined ? severity : existingRecord.severity;

        const record = await recordQueries.update(recordId, {
            record_type: finalRecordType,
            name: finalName,
            date: finalDate,
            reactions: finalReactions,
            severity: finalSeverity,
        });

        res.status(200).json(record);
    } catch (error) {
        next(error);
    }
};

export const deleteRecord = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const recordId = parseInt(req.params.id, 10);

        const record = await recordQueries.getById(recordId);
        if (!record) {
            res.status(404).json({ message: 'Medical record not found' });
            return;
        }

        await recordQueries.delete(recordId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};