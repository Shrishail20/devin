import { Response } from 'express';
import { Site, Template, Guest, Wish, TemplateVersion, TemplateSection } from '../models';
import { AuthRequest } from '../middleware';
import { v4 as uuidv4 } from 'uuid';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + uuidv4().slice(0, 8);
};

// Create a new site from a template (LEGACY - use microsites instead)
export const createSite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId, title } = req.body;

    const template = await Template.findById(templateId) as any;
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (!template.isActive) {
      res.status(400).json({ error: 'Template is not published' });
      return;
    }

    const slug = generateSlug(title);

    // Try to get sections from the new schema (TemplateSection collection)
    let sections: any[] = [];
    
    // First, try to get sections from TemplateVersion -> TemplateSection
    const templateVersion = await TemplateVersion.findOne({ templateId: template._id }).sort({ version: -1 });
    if (templateVersion) {
      const templateSections = await TemplateSection.find({ versionId: templateVersion._id }).sort({ order: 1 });
      sections = templateSections.map((section: any) => ({
        sectionId: section.sectionId || section._id.toString(),
        visible: section.canDisable !== false,
        order: section.order,
        content: section.sampleValues || {}
      }));
    }
    
    // Fallback to legacy embedded sections if no sections found in new schema
    if (sections.length === 0 && template.sections && template.sections.length > 0) {
      sections = template.sections.map((section: any, index: number) => ({
        sectionId: section.id,
        visible: section.defaultVisible !== false,
        order: index,
        content: {}
      }));
    }

    // Get color schemes and font pairs from template version or template
    let colorSchemes = template.colorSchemes || [];
    let fontPairs = template.fontPairs || [];
    
    if (templateVersion) {
      colorSchemes = templateVersion.colorSchemes || colorSchemes;
      fontPairs = templateVersion.fontPairs || fontPairs;
    }

    const site = new Site({
      userId: req.user?.id,
      templateId: template._id,
      templateVersion: template.currentVersion || 1,
      title,
      slug,
      sections,
      selectedColorScheme: colorSchemes[0]?.id || '',
      selectedFontPair: fontPairs[0]?.id || ''
    });

    await site.save();

    // Increment template usage count
    template.usageCount = (template.usageCount || 0) + 1;
    await template.save();

    res.status(201).json(site);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Get all sites for current user
export const getSites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    const query: Record<string, unknown> = { userId: req.user?.id };
    
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$text = { $search: search as string };
    }

    const sites = await Site.find(query)
      .populate('templateId', 'name slug thumbnail colorSchemes fontPairs')
      .sort({ updatedAt: -1 });

    res.json({ sites });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get single site by ID
export const getSite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id })
      .populate('templateId');

    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get site by slug (public)
export const getSiteBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ slug: req.params.slug, status: 'published' })
      .populate('templateId');

    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    // Increment view count
    site.stats.views += 1;
    await site.save();

    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Update site metadata
export const updateSite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, selectedColorScheme, selectedFontPair, settings } = req.body;

    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    if (title !== undefined) site.title = title;
    if (description !== undefined) site.description = description;
    if (selectedColorScheme !== undefined) site.selectedColorScheme = selectedColorScheme;
    if (selectedFontPair !== undefined) site.selectedFontPair = selectedFontPair;
    if (settings !== undefined) {
      site.settings = { ...site.settings, ...settings };
    }

    await site.save();
    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Update site slug
export const updateSiteSlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.body;

    // Check if slug is available
    const existingSite = await Site.findOne({ slug, _id: { $ne: req.params.id } });
    if (existingSite) {
      res.status(400).json({ error: 'This URL is already taken' });
      return;
    }

    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    site.slug = slug;
    await site.save();
    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Update section content
export const updateSectionContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sectionId } = req.params;
    const { content, visible } = req.body;

    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const sectionIndex = site.sections.findIndex(s => s.sectionId === sectionId);
    if (sectionIndex === -1) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    if (content !== undefined) {
      site.sections[sectionIndex].content = content;
    }
    if (visible !== undefined) {
      site.sections[sectionIndex].visible = visible;
    }

    await site.save();
    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Reorder site sections
export const reorderSiteSections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sectionOrder } = req.body;

    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id })
      .populate('templateId');
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const template = site.templateId as any;
    
    // Check for locked sections
    const lockedSections = template.sections.filter((s: any) => s.isLocked);
    
    // Reorder sections
    const reorderedSections = sectionOrder.map((sectionId: string, index: number) => {
      const section = site.sections.find(s => s.sectionId === sectionId);
      if (section) {
        return { ...section, order: index };
      }
      return null;
    }).filter(Boolean);

    site.sections = reorderedSections;
    await site.save();
    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Publish site
export const publishSite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id })
      .populate('templateId');
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const template = site.templateId as any;

    // Validate required fields
    const missingFields: string[] = [];
    for (const templateSection of template.sections) {
      if (!templateSection.isRequired) continue;
      
      const siteSection = site.sections.find(s => s.sectionId === templateSection.id);
      if (!siteSection?.visible) continue;

      for (const field of templateSection.fields) {
        if (field.required) {
          const value = siteSection?.content?.[field.id];
          if (value === undefined || value === null || value === '') {
            missingFields.push(`${templateSection.name}: ${field.label}`);
          }
        }
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({ 
        error: 'Please fill in all required fields',
        missingFields 
      });
      return;
    }

    site.status = 'published';
    site.publishedAt = new Date();
    await site.save();

    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Unpublish site
export const unpublishSite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    site.status = 'draft';
    await site.save();

    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Delete site
export const deleteSite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });

    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    // Delete associated guests and wishes
    await Guest.deleteMany({ siteId: req.params.id });
    await Wish.deleteMany({ siteId: req.params.id });

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get site stats
export const getSiteStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const [guestStats, wishStats] = await Promise.all([
      Guest.aggregate([
        { $match: { siteId: site._id } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalGuests: { $sum: '$numberOfGuests' }
        }}
      ]),
      Wish.aggregate([
        { $match: { siteId: site._id } },
        { $group: { _id: '$status', count: { $sum: 1 } }}
      ])
    ]);

    res.json({
      views: site.stats.views,
      uniqueVisitors: site.stats.uniqueVisitors,
      rsvp: {
        total: guestStats.reduce((sum, g) => sum + g.count, 0),
        attending: guestStats.find(g => g._id === 'attending')?.count || 0,
        notAttending: guestStats.find(g => g._id === 'not_attending')?.count || 0,
        maybe: guestStats.find(g => g._id === 'maybe')?.count || 0,
        pending: guestStats.find(g => g._id === 'pending')?.count || 0,
        totalGuests: guestStats.find(g => g._id === 'attending')?.totalGuests || 0
      },
      wishes: {
        total: wishStats.reduce((sum, w) => sum + w.count, 0),
        pending: wishStats.find(w => w._id === 'pending')?.count || 0,
        approved: wishStats.find(w => w._id === 'approved')?.count || 0,
        rejected: wishStats.find(w => w._id === 'rejected')?.count || 0
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
