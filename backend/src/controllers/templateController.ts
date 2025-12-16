import { Response } from 'express';
import { Template, TemplateInstance } from '../models';
import { AuthRequest, createError } from '../middleware';
import { interpolateComponent, extractVariables } from '../utils';
import { v4 as uuidv4 } from 'uuid';

export const createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, tags, components, dataSchema } = req.body;

    const template = new Template({
      name,
      description,
      category,
      tags,
      components: components || [],
      dataSchema: dataSchema || {},
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

export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, tags, components, dataSchema, status } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (category !== undefined) template.category = category;
    if (tags !== undefined) template.tags = tags;
    if (components !== undefined) template.components = components;
    if (dataSchema !== undefined) template.dataSchema = dataSchema;
    if (status !== undefined) template.status = status;

    template.version += 1;
    await template.save();

    res.json(template);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    await TemplateInstance.deleteMany({ templateId: req.params.id });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const duplicateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const originalTemplate = await Template.findById(req.params.id);

    if (!originalTemplate) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const duplicatedTemplate = new Template({
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      category: originalTemplate.category,
      tags: originalTemplate.tags,
      components: originalTemplate.components.map(comp => ({
        ...comp,
        id: uuidv4()
      })),
      dataSchema: originalTemplate.dataSchema,
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

export const previewTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const { data } = req.body;

    const interpolatedComponents = template.components.map(component => {
      const componentObj = JSON.parse(JSON.stringify(component));
      return interpolateComponent(componentObj, data || {});
    });

    res.json({
      template: {
        ...template.toObject(),
        components: interpolatedComponents
      },
      data
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createInstance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    const { data } = req.body;

    const instance = new TemplateInstance({
      templateId: template._id,
      data,
      status: 'rendered'
    });

    const interpolatedComponents = template.components.map(component => {
      const componentObj = JSON.parse(JSON.stringify(component));
      return interpolateComponent(componentObj, data || {});
    });

    instance.renderedOutput = JSON.stringify({
      template: {
        ...template.toObject(),
        components: interpolatedComponents
      },
      data
    });

    await instance.save();
    res.status(201).json(instance);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getInstance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instance = await TemplateInstance.findById(req.params.id)
      .populate('templateId');

    if (!instance) {
      res.status(404).json({ error: 'Instance not found' });
      return;
    }

    res.json(instance);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const exportInstance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instance = await TemplateInstance.findById(req.params.id);

    if (!instance) {
      res.status(404).json({ error: 'Instance not found' });
      return;
    }

    const { format = 'html' } = req.query;

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="template-${instance._id}.html"`);
      
      const renderedData = JSON.parse(instance.renderedOutput || '{}');
      const htmlContent = generateHTML(renderedData);
      res.send(htmlContent);
    } else {
      res.status(400).json({ error: 'Unsupported export format. Use html, pdf, or png.' });
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

const generateHTML = (data: Record<string, unknown>): string => {
  const template = data.template as Record<string, unknown> | undefined;
  const components = (template?.components || []) as Array<Record<string, unknown>>;
  
  let componentsHTML = '';
  
  for (const comp of components) {
    const position = comp.position as Record<string, number> | undefined;
    const props = comp.props as Record<string, unknown> | undefined;
    const styles = comp.styles as Record<string, unknown> | undefined;
    
    const style = `
      position: absolute;
      left: ${position?.x || 0}px;
      top: ${position?.y || 0}px;
      width: ${position?.width || 100}px;
      height: ${position?.height || 50}px;
      ${Object.entries(styles || {}).map(([k, v]) => `${k}: ${v}`).join('; ')}
    `;
    
    switch (comp.type) {
      case 'text':
        componentsHTML += `<div style="${style}; font-size: ${props?.fontSize || 16}px; color: ${props?.color || '#000'}; font-family: ${props?.fontFamily || 'Arial'}; text-align: ${props?.textAlign || 'left'}">${props?.content || ''}</div>`;
        break;
      case 'heading':
        const level = props?.level || 1;
        componentsHTML += `<h${level} style="${style}; color: ${props?.color || '#000'}; font-family: ${props?.fontFamily || 'Arial'}; text-align: ${props?.textAlign || 'left'}">${props?.content || ''}</h${level}>`;
        break;
      case 'image':
        componentsHTML += `<img src="${props?.src || ''}" alt="${props?.alt || ''}" style="${style}; object-fit: ${props?.objectFit || 'cover'}; border-radius: ${props?.borderRadius || 0}px" />`;
        break;
      case 'divider':
        const isHorizontal = props?.orientation !== 'vertical';
        componentsHTML += `<div style="${style}; border-${isHorizontal ? 'bottom' : 'right'}: ${props?.thickness || 1}px ${props?.style || 'solid'} ${props?.color || '#ccc'}"></div>`;
        break;
      case 'shape':
        const borderRadius = props?.shape === 'circle' ? '50%' : `${props?.borderRadius || 0}px`;
        componentsHTML += `<div style="${style}; background-color: ${props?.backgroundColor || '#f0f0f0'}; border: ${props?.borderWidth || 1}px solid ${props?.borderColor || '#ccc'}; border-radius: ${borderRadius}"></div>`;
        break;
      default:
        componentsHTML += `<div style="${style}">${JSON.stringify(props)}</div>`;
    }
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; }
    .template-container { position: relative; width: 800px; height: 600px; margin: 0 auto; background: white; }
  </style>
</head>
<body>
  <div class="template-container">
    ${componentsHTML}
  </div>
</body>
</html>
  `.trim();
};
