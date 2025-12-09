import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import type { CloudinaryUploadResult } from '@/types';

export class CloudinaryService {
  static async upload(
    file: string,
    folder: string = 'medical-devices'
  ): Promise<CloudinaryUploadResult> {
    return uploadToCloudinary(file, folder);
  }

  static async delete(publicId: string): Promise<void> {
    return deleteFromCloudinary(publicId);
  }

  static extractPublicId(url: string): string | null {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
  }
}

