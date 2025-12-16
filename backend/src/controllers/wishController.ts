import { Response } from 'express';
import { Wish, Site } from '../models';
import { AuthRequest } from '../middleware';

// Get all wishes for a site
export const getWishes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const query: Record<string, unknown> = { siteId: req.params.siteId };
    if (status && status !== 'all') query.status = status;

    const wishes = await Wish.find(query).sort({ submittedAt: -1 });

    res.json({ wishes });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get wish stats for a site
export const getWishStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const stats = await Wish.aggregate([
      { $match: { siteId: site._id } },
      { $group: { _id: '$status', count: { $sum: 1 } }}
    ]);

    const highlightedCount = await Wish.countDocuments({ 
      siteId: site._id, 
      isHighlighted: true 
    });

    res.json({
      total: stats.reduce((sum, s) => sum + s.count, 0),
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0,
      highlighted: highlightedCount
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Approve wish
export const approveWish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const wish = await Wish.findOneAndUpdate(
      { _id: req.params.wishId, siteId: req.params.siteId },
      { status: 'approved', moderatedAt: new Date(), moderatedBy: req.user?.id },
      { new: true }
    );

    if (!wish) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }

    res.json(wish);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Reject wish
export const rejectWish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const wish = await Wish.findOneAndUpdate(
      { _id: req.params.wishId, siteId: req.params.siteId },
      { status: 'rejected', moderatedAt: new Date(), moderatedBy: req.user?.id },
      { new: true }
    );

    if (!wish) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }

    res.json(wish);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Toggle highlight
export const toggleHighlight = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const wish = await Wish.findOne({ _id: req.params.wishId, siteId: req.params.siteId });
    if (!wish) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }

    // Check highlight limit
    if (!wish.isHighlighted) {
      const highlightedCount = await Wish.countDocuments({ 
        siteId: req.params.siteId, 
        isHighlighted: true 
      });
      
      if (highlightedCount >= site.settings.maxHighlightedWishes) {
        res.status(400).json({ 
          error: `Maximum ${site.settings.maxHighlightedWishes} wishes can be highlighted` 
        });
        return;
      }
    }

    wish.isHighlighted = !wish.isHighlighted;
    await wish.save();

    res.json(wish);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Delete wish
export const deleteWish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const wish = await Wish.findOneAndDelete({ 
      _id: req.params.wishId, 
      siteId: req.params.siteId 
    });

    if (!wish) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }

    res.json({ message: 'Wish deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Bulk approve wishes
export const bulkApprove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wishIds } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    await Wish.updateMany(
      { _id: { $in: wishIds }, siteId: req.params.siteId },
      { status: 'approved', moderatedAt: new Date(), moderatedBy: req.user?.id }
    );

    res.json({ message: 'Wishes approved successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Bulk reject wishes
export const bulkReject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wishIds } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    await Wish.updateMany(
      { _id: { $in: wishIds }, siteId: req.params.siteId },
      { status: 'rejected', moderatedAt: new Date(), moderatedBy: req.user?.id }
    );

    res.json({ message: 'Wishes rejected successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Bulk delete wishes
export const bulkDelete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wishIds } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    await Wish.deleteMany({ _id: { $in: wishIds }, siteId: req.params.siteId });

    res.json({ message: 'Wishes deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Submit wish (public endpoint)
export const submitWish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { authorName, authorEmail, message } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, status: 'published' });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    if (!site.settings.enableWishes) {
      res.status(400).json({ error: 'Wishes are not enabled for this site' });
      return;
    }

    const wish = new Wish({
      siteId: req.params.siteId,
      authorName,
      authorEmail,
      message,
      status: site.settings.requireWishApproval ? 'pending' : 'approved',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await wish.save();

    // Update site stats
    site.stats.wishCount += 1;
    await site.save();

    res.status(201).json({ 
      message: site.settings.requireWishApproval 
        ? 'Thank you for your wishes! Your message will appear after review.' 
        : 'Thank you for your wishes!',
      wish 
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Get approved wishes (public endpoint)
export const getApprovedWishes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, status: 'published' });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const wishes = await Wish.find({ 
      siteId: req.params.siteId, 
      status: 'approved' 
    })
    .select('authorName message isHighlighted submittedAt')
    .sort({ isHighlighted: -1, submittedAt: -1 });

    res.json({ wishes });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
