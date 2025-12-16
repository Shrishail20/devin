import { Response } from 'express';
import { Template, Site } from '../models';
import { AuthRequest } from '../middleware';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + uuidv4().slice(0, 8);
};

// Create a new template (admin only)
export const createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, sections, colorSchemes, fontPairs, previewDataSets } = req.body;

    const slug = generateSlug(name);

    const template = new Template({
      name,
      slug,
      description,
      category,
      sections: sections || [],
      colorSchemes: colorSchemes || [],
      fontPairs: fontPairs || [],
      previewDataSets: previewDataSets || [],
      createdBy: req.user?.id
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: Record<string, unknown> = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: Record<string, 1 | -1> = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

    const [templates, total] = await Promise.all([
      Template.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email'),
      Template.countDocuments(query)
    ]);

    res.json({
      templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get published templates for users to browse
export const getPublishedTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    const query: Record<string, unknown> = { status: 'published' };
    
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$text = { $search: search as string };
    }

        const templates = await Template.find(query)
          .select('name slug description category thumbnail previewImages colorSchemes fontPairs usageCount sections previewDataSets')
          .sort({ usageCount: -1, createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Update template
export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, thumbnail, previewImages, sections, colorSchemes, fontPairs, previewDataSets, status } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (category !== undefined) template.category = category;
    if (thumbnail !== undefined) template.thumbnail = thumbnail;
    if (previewImages !== undefined) template.previewImages = previewImages;
    if (sections !== undefined) template.sections = sections;
    if (colorSchemes !== undefined) template.colorSchemes = colorSchemes;
    if (fontPairs !== undefined) template.fontPairs = fontPairs;
    if (previewDataSets !== undefined) template.previewDataSets = previewDataSets;
    if (status !== undefined) template.status = status;

    template.version += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Delete template
export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    await Site.deleteMany({ templateId: req.params.id });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Duplicate template
export const duplicateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const originalTemplate = await Template.findById(req.params.id);

    if (!originalTemplate) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const duplicatedTemplate = new Template({
      name: `${originalTemplate.name} (Copy)`,
      slug: generateSlug(`${originalTemplate.name} copy`),
      description: originalTemplate.description,
      category: originalTemplate.category,
      thumbnail: originalTemplate.thumbnail,
      previewImages: originalTemplate.previewImages,
      sections: originalTemplate.sections.map(section => ({
        ...section,
        id: uuidv4()
      })),
      colorSchemes: originalTemplate.colorSchemes,
      fontPairs: originalTemplate.fontPairs,
      previewDataSets: originalTemplate.previewDataSets,
      status: 'draft',
      version: 1,
      createdBy: req.user?.id
    });

    await duplicatedTemplate.save();
    res.status(201).json(duplicatedTemplate);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Publish template
export const publishTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    template.status = 'published';
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Unpublish template
export const unpublishTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    template.status = 'draft';
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Preview template with data
export const previewTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const { previewDataSetName } = req.body;

    let previewData = template.previewDataSets[0]?.data || {};
    if (previewDataSetName) {
      const dataSet = template.previewDataSets.find(ds => ds.name === previewDataSetName);
      if (dataSet) previewData = dataSet.data;
    }

    res.json({
      template,
      previewData
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Add section to template
export const addSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const { type, name, fields, isRequired, isLocked, defaultVisible } = req.body;

    const newSection = {
      id: uuidv4(),
      type,
      name,
      order: template.sections.length,
      isRequired: isRequired || false,
      isLocked: isLocked || false,
      defaultVisible: defaultVisible !== false,
      fields: fields || []
    };

    template.sections.push(newSection);
    template.version += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Update section in template
export const updateSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const sectionIndex = template.sections.findIndex(s => s.id === req.params.sectionId);
    if (sectionIndex === -1) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    const { name, fields, isRequired, isLocked, defaultVisible, order } = req.body;

    if (name !== undefined) template.sections[sectionIndex].name = name;
    if (fields !== undefined) template.sections[sectionIndex].fields = fields;
    if (isRequired !== undefined) template.sections[sectionIndex].isRequired = isRequired;
    if (isLocked !== undefined) template.sections[sectionIndex].isLocked = isLocked;
    if (defaultVisible !== undefined) template.sections[sectionIndex].defaultVisible = defaultVisible;
    if (order !== undefined) template.sections[sectionIndex].order = order;

    template.version += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Delete section from template
export const deleteSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const sectionIndex = template.sections.findIndex(s => s.id === req.params.sectionId);
    if (sectionIndex === -1) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    template.sections.splice(sectionIndex, 1);
    
    template.sections.forEach((section, index) => {
      section.order = index;
    });

    template.version += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Reorder sections
export const reorderSections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const { sectionOrder } = req.body;

    if (!Array.isArray(sectionOrder)) {
      res.status(400).json({ error: 'sectionOrder must be an array of section IDs' });
      return;
    }

    const reorderedSections = sectionOrder.map((sectionId, index) => {
      const section = template.sections.find(s => s.id === sectionId);
      if (section) {
        return { ...section, order: index };
      }
      return null;
    }).filter(Boolean);

    template.sections = reorderedSections as typeof template.sections;
    template.version += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
