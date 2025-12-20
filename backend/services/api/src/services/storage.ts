import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AWS S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'linkvesta-storage';

export const storageService = {
  /**
   * Upload a file to cloud storage
   */
  async uploadFile(filename: string, fileBuffer: Buffer, contentType?: string): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType || 'application/octet-stream',
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Get a file from cloud storage
   */
  async getFile(filename: string): Promise<Buffer> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: filename,
    };

    try {
      const result = await s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  },

  /**
   * Delete a file from cloud storage
   */
  async deleteFile(filename: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: filename,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};

