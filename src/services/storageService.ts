import { storage, isFirebaseConfigured } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadResult {
  url: string;
  isExternalStorage: boolean;
}

export const storageService = {
  /**
   * Validate image file constraints
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported image format. Please upload JPG, PNG, WEBP, or GIF.'
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit. Please choose a smaller image.'
      };
    }

    return { valid: true };
  },

  /**
   * Upload image to Firebase Storage (Google Cloud Storage) or convert to preview URL
   */
  async uploadItemPhoto(file: File): Promise<UploadResult> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (isFirebaseConfigured() && storage) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `item-photos/${fileName}`;
        const storageRef = ref(storage, filePath);

        await uploadBytes(storageRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedAt: new Date().toISOString()
          }
        });

        const downloadUrl = await getDownloadURL(storageRef);

        return {
          url: downloadUrl,
          isExternalStorage: true
        };
      } catch (err: any) {
        console.warn('Firebase Storage upload failed, falling back to local data URL:', err);
        return {
          url: await this.fileToDataUrl(file),
          isExternalStorage: false
        };
      }
    } else {
      // In demo mode, convert to local base64 Data URL
      const dataUrl = await this.fileToDataUrl(file);
      return {
        url: dataUrl,
        isExternalStorage: false
      };
    }
  },

  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
};
