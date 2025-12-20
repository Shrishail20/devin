import { Response } from 'express';
import { Template, TemplateVersion, TemplateSection, Microsite, MicrositeSection, Guest, Wish } from '../models';
import { AuthRequest } from '../middleware';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + uuidv4().slice(0, 8);
};

// Create a new microsite from template
export const createMicrosite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { templateId, title } = req.body;

    // Get template
    const template = await Template.findById(templateId);
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Get current version
    const version = await TemplateVersion.findOne({
      templateId: template._id,
      version: template.currentVersion
    });

    if (!version) {
      res.status(404).json({ error: 'Template version not found' });
      return;
    }

    // Get template sections
    const templateSections = await TemplateSection.find({
      versionId: version._id
    }).sort({ order: 1 });

    // Create microsite
    const microsite = new Microsite({
      userId: req.user?.id,
      templateId: template._id,
      versionId: version._id,
      title,
      slug: generateSlug(title),
      status: 'draft',
      colorScheme: version.defaultColorScheme,
      fontPair: version.defaultFontPair,
      settings: {
        enableRsvp: true,
        enableWishes: true,
        requireWishApproval: true,
        timezone: 'UTC'
      }
    });

    await microsite.save();

    // Create microsite sections with sample values as initial content
    for (const templateSection of templateSections) {
      const micrositeSection = new MicrositeSection({
        micrositeId: microsite._id,
        sectionId: templateSection.sectionId,
        type: templateSection.type,
        order: templateSection.order,
        enabled: true,
        values: templateSection.sampleValues || {}
      });

      await micrositeSection.save();
    }

    // Increment template usage count
    template.usageCount += 1;
    await template.save();

    // Get created sections
    const sections = await MicrositeSection.find({
      micrositeId: microsite._id
    }).sort({ order: 1 });

    res.status(201).json({ microsite, sections });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Get user's microsites
export const getMicrosites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    const query: Record<string, unknown> = { userId: req.user?.id };
    
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$text = { $search: search as string };
    }

    const microsites = await Microsite.find(query)
      .sort({ updatedAt: -1 })
      .populate('templateId', 'name category thumbnail');

    res.json({ microsites });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get single microsite with sections
export const getMicrosite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    }).populate('templateId', 'name category thumbnail');

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    // Get version
    const version = await TemplateVersion.findById(microsite.versionId);

    // Get template sections (for field definitions)
    const templateSections = version ? await TemplateSection.find({
      versionId: version._id
    }).sort({ order: 1 }) : [];

    // Get microsite sections (user content)
    const sections = await MicrositeSection.find({
      micrositeId: microsite._id
    }).sort({ order: 1 });

    res.json({ microsite, version, templateSections, sections });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Update microsite basic info
export const updateMicrosite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, colorScheme, fontPair, settings } = req.body;

    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    if (title !== undefined) microsite.title = title;
    if (colorScheme !== undefined) microsite.colorScheme = colorScheme;
    if (fontPair !== undefined) microsite.fontPair = fontPair;
    if (settings !== undefined) {
      microsite.settings = { ...microsite.settings, ...settings };
    }

    await microsite.save();

    res.json(microsite);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Update microsite section (user content)
export const updateMicrositeSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { values, enabled, order } = req.body;

    // Verify microsite ownership
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    const section = await MicrositeSection.findOne({
      _id: req.params.sectionId,
      micrositeId: microsite._id
    });

    if (!section) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    if (values !== undefined) section.values = values;
    if (enabled !== undefined) section.enabled = enabled;
    if (order !== undefined) section.order = order;

    await section.save();

    res.json(section);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Toggle section enabled/disabled
export const toggleSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify microsite ownership
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    const section = await MicrositeSection.findOne({
      _id: req.params.sectionId,
      micrositeId: microsite._id
    });

    if (!section) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    section.enabled = !section.enabled;
    await section.save();

    res.json(section);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Reorder microsite sections
export const reorderMicrositeSections = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sectionOrder } = req.body;

    // Verify microsite ownership
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    if (!Array.isArray(sectionOrder)) {
      res.status(400).json({ error: 'sectionOrder must be an array of section IDs' });
      return;
    }

    // Update order for each section
    for (let i = 0; i < sectionOrder.length; i++) {
      await MicrositeSection.findOneAndUpdate(
        { _id: sectionOrder[i], micrositeId: microsite._id },
        { order: i }
      );
    }

    const sections = await MicrositeSection.find({
      micrositeId: microsite._id
    }).sort({ order: 1 });

    res.json({ sections });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Publish microsite
export const publishMicrosite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    microsite.status = 'published';
    microsite.publishedAt = new Date();
    await microsite.save();

    res.json(microsite);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Unpublish microsite
export const unpublishMicrosite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    microsite.status = 'draft';
    await microsite.save();

    res.json(microsite);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Delete microsite
export const deleteMicrosite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    // Delete sections
    await MicrositeSection.deleteMany({ micrositeId: microsite._id });

    // Delete guests and wishes
    await Guest.deleteMany({ siteId: microsite._id });
    await Wish.deleteMany({ siteId: microsite._id });

    await Microsite.findByIdAndDelete(microsite._id);

    res.json({ message: 'Microsite deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get microsite stats
export const getMicrositeStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const microsite = await Microsite.findOne({
      _id: req.params.id,
      userId: req.user?.id
    });

    if (!microsite) {
      res.status(404).json({ error: 'Microsite not found' });
      return;
    }

    // Get guest counts
    const [totalGuests, attendingGuests, pendingGuests] = await Promise.all([
      Guest.countDocuments({ siteId: microsite._id }),
      Guest.countDocuments({ siteId: microsite._id, status: 'attending' }),
      Guest.countDocuments({ siteId: microsite._id, status: 'pending' })
    ]);

    // Get wish counts
    const [totalWishes, approvedWishes, pendingWishes] = await Promise.all([
      Wish.countDocuments({ siteId: microsite._id }),
      Wish.countDocuments({ siteId: microsite._id, status: 'approved' }),
      Wish.countDocuments({ siteId: microsite._id, status: 'pending' })
    ]);

    res.json({
      views: microsite.viewCount,
      uniqueViews: microsite.uniqueViewCount,
      guests: {
        total: totalGuests,
        attending: attendingGuests,
        pending: pendingGuests
      },
      wishes: {
        total: totalWishes,
        approved: approvedWishes,
        pending: pendingWishes
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC ENDPOINTS

// Get public microsite by slug
export const getPublicMicrosite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const microsite = await Microsite.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!microsite) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Increment view count
    microsite.viewCount += 1;
    microsite.lastViewedAt = new Date();
    await microsite.save();

    // Get version
    const version = await TemplateVersion.findById(microsite.versionId);

    // Get template sections (for field definitions and rendering)
    const templateSections = version ? await TemplateSection.find({
      versionId: version._id
    }).sort({ order: 1 }) : [];

    // Get microsite sections (user content) - only enabled ones
    const sections = await MicrositeSection.find({
      micrositeId: microsite._id,
      enabled: true
    }).sort({ order: 1 });

    // Get approved wishes
    const wishes = await Wish.find({
      siteId: microsite._id,
      status: 'approved'
    }).sort({ createdAt: -1 }).limit(50);

    res.json({
      microsite: {
        title: microsite.title,
        slug: microsite.slug,
        colorScheme: microsite.colorScheme,
        fontPair: microsite.fontPair,
        settings: microsite.settings
      },
      version: version ? {
        colorSchemes: version.colorSchemes,
        fontPairs: version.fontPairs
      } : null,
      templateSections,
      sections,
      wishes
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Submit RSVP (for microsites)
export const submitMicrositeRsvp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, status, partySize, dietaryNotes, message } = req.body;

    const microsite = await Microsite.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!microsite) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (!microsite.settings.enableRsvp) {
      res.status(400).json({ error: 'RSVP is not enabled for this event' });
      return;
    }

    // Check if already RSVPed
    const existingGuest = await Guest.findOne({
      siteId: microsite._id,
      email: email.toLowerCase()
    });

    if (existingGuest) {
      // Update existing RSVP
      existingGuest.name = name;
      existingGuest.phone = phone;
      existingGuest.status = status;
      existingGuest.partySize = partySize || 1;
      existingGuest.dietaryNotes = dietaryNotes;
      existingGuest.message = message;
      await existingGuest.save();

      res.json({ message: 'RSVP updated successfully', guest: existingGuest });
      return;
    }

    // Create new RSVP
    const guest = new Guest({
      siteId: microsite._id,
      name,
      email: email.toLowerCase(),
      phone,
      status,
      partySize: partySize || 1,
      dietaryNotes,
      message
    });

    await guest.save();

    res.status(201).json({ message: 'RSVP submitted successfully', guest });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Submit wish (for microsites)
export const submitMicrositeWish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, message } = req.body;

    const microsite = await Microsite.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!microsite) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (!microsite.settings.enableWishes) {
      res.status(400).json({ error: 'Wishes are not enabled for this event' });
      return;
    }

    const wish = new Wish({
      siteId: microsite._id,
      name,
      message,
      status: microsite.settings.requireWishApproval ? 'pending' : 'approved'
    });

    await wish.save();

    res.status(201).json({ 
      message: microsite.settings.requireWishApproval 
        ? 'Wish submitted and pending approval' 
        : 'Wish submitted successfully',
      wish 
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
