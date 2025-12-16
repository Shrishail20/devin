import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gridFSBucket: GridFSBucket | null = null;

export const initGridFS = (): GridFSBucket => {
  if (!gridFSBucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    gridFSBucket = new GridFSBucket(db, {
      bucketName: 'media'
    });
  }
  return gridFSBucket;
};

export const getGridFSBucket = (): GridFSBucket => {
  if (!gridFSBucket) {
    return initGridFS();
  }
  return gridFSBucket;
};
