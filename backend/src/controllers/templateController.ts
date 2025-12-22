import { Response } from 'express';
import { Template, TemplateVersion, TemplateSection, Microsite, MicrositeSection } from '../models';
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
    const { name, description, category, thumbnail, isPremium, sections, colorSchemes, fontPairs, previewDataSets } = req.body;

    const slug = generateSlug(name);

    // Create the template
    const template = new Template({
      slug,
      name,
      description,
      category,
      thumbnail,
      isPremium: isPremium || false,
      currentVersion: 1,
      isActive: false,
      createdBy: req.user?.id
    });

    await template.save();

    // Create initial version with color schemes and font pairs
    console.log('fontPairs received:', JSON.stringify(fontPairs, null, 2));
    const mappedFontPairs = (fontPairs || []).map((fp: Record<string, unknown>) => ({
      id: fp.id,
      name: fp.name,
      heading: fp.heading || fp.headingFont,
      body: fp.body || fp.bodyFont,
      headingWeight: fp.headingWeight || 700,
      bodyWeight: fp.bodyWeight || 400
    }));
    console.log('mappedFontPairs:', JSON.stringify(mappedFontPairs, null, 2));
    
    const version = new TemplateVersion({
      templateId: template._id,
      version: 1,
      colorSchemes: (colorSchemes || []).map((cs: Record<string, string>) => ({
        id: cs.id,
        name: cs.name,
        primary: cs.primary,
        secondary: cs.secondary,
        background: cs.background || '#FFFFFF',
        surface: cs.surface || '#FAFAFA',
        text: cs.text || '#212121',
        textMuted: cs.textMuted || '#757575',
        accent: cs.accent
      })),
      fontPairs: (fontPairs || []).map((fp: Record<string, unknown>) => ({
        id: fp.id,
        name: fp.name,
        heading: fp.heading || fp.headingFont,
        body: fp.body || fp.bodyFont,
        headingWeight: fp.headingWeight || 700,
        bodyWeight: fp.bodyWeight || 400
      })),
      defaultColorScheme: colorSchemes?.[0]?.id || '',
      defaultFontPair: fontPairs?.[0]?.id || '',
      changelog: 'Initial version'
    });

    await version.save();

    // Create sections if provided
    const createdSections = [];
    if (sections && Array.isArray(sections)) {
      for (let i = 0; i < sections.length; i++) {
        const sectionData = sections[i];
        
        // Get sample values - prioritize sectionData.sampleValues, then fall back to previewDataSets
        let sampleValues: Record<string, unknown> = sectionData.sampleValues || {};
        if (Object.keys(sampleValues).length === 0 && previewDataSets && previewDataSets.length > 0 && previewDataSets[0].data) {
          sampleValues = previewDataSets[0].data[sectionData.id] || {};
        }

        const newSection = new TemplateSection({
          versionId: version._id,
          sectionId: 'sec_' + uuidv4().slice(0, 8),
          type: sectionData.type,
          name: sectionData.name,
          description: sectionData.description || '',
          order: i,
          isRequired: sectionData.isRequired || false,
          canDisable: sectionData.canDisable !== false,
          fields: (sectionData.fields || []).map((field: Record<string, unknown>) => ({
            fieldId: 'fld_' + uuidv4().slice(0, 8),
            key: field.key || field.id || field.name,
            label: field.label || field.name || 'Field',
            type: field.type || 'text',
            placeholder: field.placeholder || '',
            defaultValue: field.defaultValue,
            options: field.options,
            validation: field.validation ? field.validation : (field.required ? { required: true } : undefined)
          })),
          sampleValues
        });

        await newSection.save();
        createdSections.push(newSection);
      }
    }

    res.status(201).json({ template, version, sections: createdSections });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Get all templates (admin)
export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      isActive, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: Record<string, unknown> = {};
    
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (category && category !== 'all') query.category = category;
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

// Get single template with current version and sections
export const getTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Get current version
    const version = await TemplateVersion.findOne({
      templateId: template._id,
      version: template.currentVersion
    });

    // Get sections for this version
    const sections = version ? await TemplateSection.find({
      versionId: version._id
    }).sort({ order: 1 }) : [];

    res.json({ template, version, sections });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get published templates for users to browse
export const getPublishedTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    const query: Record<string, unknown> = { isActive: true };
    
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$text = { $search: search as string };
    }

    const templates = await Template.find(query)
      .select('name slug description category thumbnail currentVersion usageCount isPremium')
      .sort({ usageCount: -1, createdAt: -1 });

    // Get versions and sections for each template
    const templatesWithDetails = await Promise.all(
      templates.map(async (template) => {
        const version = await TemplateVersion.findOne({
          templateId: template._id,
          version: template.currentVersion
        });

        const sections = version ? await TemplateSection.find({
          versionId: version._id
        }).sort({ order: 1 }) : [];

        return {
          ...template.toObject(),
          version,
          sections
        };
      })
    );

    res.json({ templates: templatesWithDetails });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Update template basic info
export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, thumbnail, isPremium } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (category !== undefined) template.category = category;
    if (thumbnail !== undefined) template.thumbnail = thumbnail;
    if (isPremium !== undefined) template.isPremium = isPremium;

    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Update template version (design options)
export const updateTemplateVersion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { colorSchemes, fontPairs, defaultColorScheme, defaultFontPair } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const version = await TemplateVersion.findOne({
      templateId: template._id,
      version: template.currentVersion
    });

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    if (colorSchemes !== undefined) version.colorSchemes = colorSchemes;
    if (fontPairs !== undefined) version.fontPairs = fontPairs;
    if (defaultColorScheme !== undefined) version.defaultColorScheme = defaultColorScheme;
    if (defaultFontPair !== undefined) version.defaultFontPair = defaultFontPair;

    await version.save();

    res.json(version);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Delete template
export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Delete all versions
    const versions = await TemplateVersion.find({ templateId: template._id });
    
    // Delete all sections for all versions
    for (const version of versions) {
      await TemplateSection.deleteMany({ versionId: version._id });
    }
    
    await TemplateVersion.deleteMany({ templateId: template._id });

    // Delete microsites and their sections
    const microsites = await Microsite.find({ templateId: template._id });
    for (const microsite of microsites) {
      await MicrositeSection.deleteMany({ micrositeId: microsite._id });
    }
    await Microsite.deleteMany({ templateId: template._id });

    await Template.findByIdAndDelete(req.params.id);

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

    // Create new template
    const duplicatedTemplate = new Template({
      slug: generateSlug(`${originalTemplate.name} copy`),
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      category: originalTemplate.category,
      thumbnail: originalTemplate.thumbnail,
      currentVersion: 1,
      isActive: false,
      isPremium: originalTemplate.isPremium,
      createdBy: req.user?.id
    });

    await duplicatedTemplate.save();

    // Get original version
    const originalVersion = await TemplateVersion.findOne({
      templateId: originalTemplate._id,
      version: originalTemplate.currentVersion
    });

    if (originalVersion) {
      // Create new version
      const newVersion = new TemplateVersion({
        templateId: duplicatedTemplate._id,
        version: 1,
        colorSchemes: originalVersion.colorSchemes,
        fontPairs: originalVersion.fontPairs,
        defaultColorScheme: originalVersion.defaultColorScheme,
        defaultFontPair: originalVersion.defaultFontPair,
        changelog: 'Duplicated from ' + originalTemplate.name
      });

      await newVersion.save();

      // Copy sections
      const originalSections = await TemplateSection.find({ versionId: originalVersion._id });
      
      for (const section of originalSections) {
        const newSection = new TemplateSection({
          versionId: newVersion._id,
          sectionId: 'sec_' + uuidv4().slice(0, 8),
          type: section.type,
          name: section.name,
          description: section.description,
          order: section.order,
          isRequired: section.isRequired,
          canDisable: section.canDisable,
          fields: section.fields.map(field => ({
            ...field,
            fieldId: 'fld_' + uuidv4().slice(0, 8)
          })),
          sampleValues: section.sampleValues
        });

        await newSection.save();
      }
    }

    res.status(201).json(duplicatedTemplate);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Publish template (make active)
export const publishTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    template.isActive = true;
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

    template.isActive = false;
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Create new version of template
export const createNewVersion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { changelog } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Get current version
    const currentVersion = await TemplateVersion.findOne({
      templateId: template._id,
      version: template.currentVersion
    });

    if (!currentVersion) {
      res.status(404).json({ error: 'Current version not found' });
      return;
    }

    // Create new version
    const newVersionNumber = template.currentVersion + 1;
    const newVersion = new TemplateVersion({
      templateId: template._id,
      version: newVersionNumber,
      colorSchemes: currentVersion.colorSchemes,
      fontPairs: currentVersion.fontPairs,
      defaultColorScheme: currentVersion.defaultColorScheme,
      defaultFontPair: currentVersion.defaultFontPair,
      changelog: changelog || `Version ${newVersionNumber}`
    });

    await newVersion.save();

    // Copy sections to new version
    const currentSections = await TemplateSection.find({ versionId: currentVersion._id });
    
    for (const section of currentSections) {
      const newSection = new TemplateSection({
        versionId: newVersion._id,
        sectionId: section.sectionId,
        type: section.type,
        name: section.name,
        description: section.description,
        order: section.order,
        isRequired: section.isRequired,
        canDisable: section.canDisable,
        fields: section.fields,
        sampleValues: section.sampleValues
      });

      await newSection.save();
    }

    // Update template current version
    template.currentVersion = newVersionNumber;
    await template.save();

    res.status(201).json({ template, version: newVersion });
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

    const version = await TemplateVersion.findOne({
      templateId: template._id,
      version: template.currentVersion
    });

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    const { type, name, description, fields, isRequired, canDisable, sampleValues } = req.body;

    // Get current max order
    const existingSections = await TemplateSection.find({ versionId: version._id });
    const maxOrder = existingSections.length > 0 
      ? Math.max(...existingSections.map(s => s.order)) 
      : -1;

    const newSection = new TemplateSection({
      versionId: version._id,
      sectionId: 'sec_' + uuidv4().slice(0, 8),
      type,
      name,
      description: description || '',
      order: maxOrder + 1,
      isRequired: isRequired || false,
      canDisable: canDisable !== false,
      fields: (fields || []).map((field: Record<string, unknown>) => ({
        ...field,
        fieldId: field.fieldId || 'fld_' + uuidv4().slice(0, 8)
      })),
      sampleValues: sampleValues || {}
    });

    await newSection.save();

    res.status(201).json(newSection);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Update section
export const updateSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const section = await TemplateSection.findById(req.params.sectionId);

    if (!section) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    const { name, description, fields, isRequired, canDisable, sampleValues, order } = req.body;

    if (name !== undefined) section.name = name;
    if (description !== undefined) section.description = description;
    if (fields !== undefined) {
      section.fields = fields.map((field: Record<string, unknown>) => ({
        ...field,
        fieldId: field.fieldId || 'fld_' + uuidv4().slice(0, 8)
      }));
    }
    if (isRequired !== undefined) section.isRequired = isRequired;
    if (canDisable !== undefined) section.canDisable = canDisable;
    if (sampleValues !== undefined) section.sampleValues = sampleValues;
    if (order !== undefined) section.order = order;

    await section.save();

    res.json(section);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Delete section
export const deleteSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const section = await TemplateSection.findByIdAndDelete(req.params.sectionId);

    if (!section) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    // Reorder remaining sections
    const remainingSections = await TemplateSection.find({ 
      versionId: section.versionId 
    }).sort({ order: 1 });

    for (let i = 0; i < remainingSections.length; i++) {
      remainingSections[i].order = i;
      await remainingSections[i].save();
    }

    res.json({ message: 'Section deleted successfully' });
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

    const version = await TemplateVersion.findOne({
      templateId: template._id,
      version: template.currentVersion
    });

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    const { sectionOrder } = req.body;

    if (!Array.isArray(sectionOrder)) {
      res.status(400).json({ error: 'sectionOrder must be an array of section IDs' });
      return;
    }

    // Update order for each section
    for (let i = 0; i < sectionOrder.length; i++) {
      await TemplateSection.findByIdAndUpdate(sectionOrder[i], { order: i });
    }

    const sections = await TemplateSection.find({ versionId: version._id }).sort({ order: 1 });

    res.json({ sections });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Preview template with sample data
export const previewTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const version = await TemplateVersion.findOne({
      templateId: template._id,
      version: template.currentVersion
    });

    if (!version) {
      res.status(404).json({ error: 'Version not found' });
      return;
    }

    const sections = await TemplateSection.find({ versionId: version._id }).sort({ order: 1 });

    res.json({
      template,
      version,
      sections
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
