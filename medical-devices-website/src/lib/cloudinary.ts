import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryUploadResult } from '@/types';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: string,
  folder: string = 'medical-devices'
): Promise<CloudinaryUploadResult> {
  try {
    let uploadSource: string;

    // If input is Buffer → convert to base64
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString('base64');
      uploadSource = `data:image/*;base64,${base64}`;
    } else {
      // Otherwise assume it's already a string (URL or base64)
      uploadSource = file;
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder,
      resource_type: 'auto',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
}
