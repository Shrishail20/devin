import { Response } from 'express';
import { Media } from '../models';
import { AuthRequest, generateFilename } from '../middleware';
import { getGridFSBucket } from '../config/gridfs';
import { Readable } from 'stream';
import sharp from 'sharp';
import mongoose from 'mongoose';

export const uploadMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const { tags } = req.body;

    let processedBuffer = buffer;
    if (mimetype.startsWith('image/') && mimetype !== 'image/svg+xml') {
      processedBuffer = await sharp(buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    const filename = generateFilename(originalname);
    const gridFSBucket = getGridFSBucket();

    const uploadStream = gridFSBucket.openUploadStream(filename, {
      metadata: { contentType: mimetype }
    });

    const readableStream = new Readable();
    readableStream.push(processedBuffer);
    readableStream.push(null);

    await new Promise<void>((resolve, reject) => {
      readableStream
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const media = new Media({
      filename,
      originalName: originalname,
      mimeType: mimetype,
      size: processedBuffer.length,
      url: `${baseUrl}/api/media/serve/${filename}`,
      gridFSId: uploadStream.id,
      uploadedBy: req.user?.id,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : []
    });

    await media.save();
    res.status(201).json(media);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getMediaList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags) {
      const tagArray = (tags as string).split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: Record<string, 1 | -1> = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

    const [media, total] = await Promise.all([
      Media.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Media.countDocuments(query)
    ]);

    res.json({
      media,
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

export const getMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    res.json(media);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deleteMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    const gridFSBucket = getGridFSBucket();
    await gridFSBucket.delete(media.gridFSId);

    await Media.findByIdAndDelete(req.params.id);

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const serveMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    const media = await Media.findOne({ filename });

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    const gridFSBucket = getGridFSBucket();
    
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const downloadStream = gridFSBucket.openDownloadStream(media.gridFSId);
    downloadStream.pipe(res);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
