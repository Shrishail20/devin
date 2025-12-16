import { Request, Response } from 'express';
import { componentSchemas, getComponentsByCategory } from '../utils';

export const getComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    if (category) {
      const components = getComponentsByCategory(category as string);
      res.json({ components });
    } else {
      res.json({ components: componentSchemas });
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getComponentCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = [...new Set(componentSchemas.map(c => c.category))];
    res.json({ categories });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
