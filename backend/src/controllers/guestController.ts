import { Response } from 'express';
import { Guest, Site } from '../models';
import { AuthRequest } from '../middleware';

// Get all guests for a site
export const getGuests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    // Verify site ownership
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const query: Record<string, unknown> = { siteId: req.params.siteId };
    
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$text = { $search: search as string };
    }

    const guests = await Guest.find(query).sort({ submittedAt: -1 });

    res.json({ guests });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get guest stats for a site
export const getGuestStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const stats = await Guest.aggregate([
      { $match: { siteId: site._id } },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 },
        totalGuests: { $sum: '$numberOfGuests' }
      }}
    ]);

    res.json({
      total: stats.reduce((sum, s) => sum + s.count, 0),
      attending: stats.find(s => s._id === 'attending')?.count || 0,
      notAttending: stats.find(s => s._id === 'not_attending')?.count || 0,
      maybe: stats.find(s => s._id === 'maybe')?.count || 0,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      totalGuests: stats.find(s => s._id === 'attending')?.totalGuests || 0
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Update guest status
export const updateGuestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.guestId, siteId: req.params.siteId },
      { status },
      { new: true }
    );

    if (!guest) {
      res.status(404).json({ error: 'Guest not found' });
      return;
    }

    res.json(guest);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Delete guest
export const deleteGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const guest = await Guest.findOneAndDelete({ 
      _id: req.params.guestId, 
      siteId: req.params.siteId 
    });

    if (!guest) {
      res.status(404).json({ error: 'Guest not found' });
      return;
    }

    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Export guests as CSV
export const exportGuests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const site = await Site.findOne({ _id: req.params.siteId, userId: req.user?.id });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const guests = await Guest.find({ siteId: req.params.siteId }).sort({ submittedAt: -1 });

    const csvHeader = 'Name,Email,Phone,Status,Number of Guests,Guest Names,Meal Choice,Dietary Restrictions,Message,Submitted At\n';
    const csvRows = guests.map(g => 
      `"${g.name}","${g.email || ''}","${g.phone || ''}","${g.status}","${g.numberOfGuests}","${(g.guestNames || []).join('; ')}","${g.mealChoice || ''}","${g.dietaryRestrictions || ''}","${(g.message || '').replace(/"/g, '""')}","${g.submittedAt.toISOString()}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="guests-${site.slug}.csv"`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Submit RSVP (public endpoint)
export const submitRsvp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, status, numberOfGuests, guestNames, mealChoice, dietaryRestrictions, message } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, status: 'published' });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    if (!site.settings.enableRsvp) {
      res.status(400).json({ error: 'RSVP is not enabled for this site' });
      return;
    }

    // Check for existing RSVP by email
    if (email) {
      const existingGuest = await Guest.findOne({ siteId: req.params.siteId, email });
      if (existingGuest) {
        res.status(400).json({ error: 'You have already submitted an RSVP' });
        return;
      }
    }

    const guest = new Guest({
      siteId: req.params.siteId,
      name,
      email,
      phone,
      status: status || 'attending',
      numberOfGuests: numberOfGuests || 1,
      guestNames,
      mealChoice,
      dietaryRestrictions,
      message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await guest.save();

    // Update site stats
    site.stats.rsvpCount += 1;
    await site.save();

    res.status(201).json({ message: 'RSVP submitted successfully', guest });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

// Lookup RSVP by email (public endpoint)
export const lookupRsvp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, status: 'published' });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const guest = await Guest.findOne({ siteId: req.params.siteId, email });
    if (!guest) {
      res.status(404).json({ error: 'No RSVP found for this email' });
      return;
    }

    res.json(guest);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Update RSVP (public endpoint)
export const updateRsvp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, status, numberOfGuests, guestNames, mealChoice, dietaryRestrictions, message } = req.body;

    const site = await Site.findOne({ _id: req.params.siteId, status: 'published' });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const guest = await Guest.findOne({ siteId: req.params.siteId, email });
    if (!guest) {
      res.status(404).json({ error: 'No RSVP found for this email' });
      return;
    }

    if (status !== undefined) guest.status = status;
    if (numberOfGuests !== undefined) guest.numberOfGuests = numberOfGuests;
    if (guestNames !== undefined) guest.guestNames = guestNames;
    if (mealChoice !== undefined) guest.mealChoice = mealChoice;
    if (dietaryRestrictions !== undefined) guest.dietaryRestrictions = dietaryRestrictions;
    if (message !== undefined) guest.message = message;

    await guest.save();

    res.json({ message: 'RSVP updated successfully', guest });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
