import { supabase } from '../config/supabase';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Create FormData for React Native file upload
 * @param uri Local file URI
 * @param filePath Storage path
 */
const createFormData = (uri: string, filePath: string): FormData => {
  const fileName = filePath.split('/').pop() || 'image.jpg';
  const fileType = fileName.split('.').pop() || 'jpg';
  const type = `image/${fileType}`;

  const formData = new FormData();
  // React Native FormData requires this specific object structure
  formData.append('file', {
    uri,
    name: fileName,
    type,
  } as any); // TypeScript workaround for FormData in React Native

  return formData;
};

/**
 * Upload an image to Supabase storage
 * @param imageUri Local file URI from camera or image picker
 * @param userId User ID for organizing files
 * @param filename Optional custom filename
 */
export const uploadMealImage = async (
  imageUri: string,
  userId: string,
  filename?: string
): Promise<UploadResult> => {
  try {
    // Generate filename if not provided
    const timestamp = Date.now();
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const finalFilename = filename || `meal_${timestamp}.${fileExtension}`;
    
    // Create the storage path: userId/filename
    const filePath = `${userId}/${finalFilename}`;

    // Create FormData for React Native file upload
    const formData = createFormData(imageUri, filePath);

    // Upload to Supabase storage using FormData
    const { data, error } = await supabase.storage
      .from('meal-images')
      .upload(filePath, formData, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        url: null,
        error: error.message,
      };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('meal-images')
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      error: null,
    };
  } catch (err) {
    console.error('Unexpected upload error:', err);
    return {
      url: null,
      error: 'Failed to upload image',
    };
  }
};

/**
 * Delete an image from Supabase storage
 * @param imageUrl The full URL of the image to delete
 * @param userId User ID for security validation
 */
export const deleteMealImage = async (
  imageUrl: string,
  userId: string
): Promise<{ error: string | null }> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const filePath = pathSegments.slice(-2).join('/'); // Get "userId/filename"

    // Verify the file belongs to the user
    if (!filePath.startsWith(userId)) {
      return { error: 'Unauthorized: Cannot delete another user\'s image' };
    }

    const { error } = await supabase.storage
      .from('meal-images')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected delete error:', err);
    return { error: 'Failed to delete image' };
  }
};

/**
 * Get a list of all images for a user
 * @param userId User ID
 */
export const getUserMealImages = async (
  userId: string
): Promise<{ images: string[]; error: string | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from('meal-images')
      .list(userId, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('Storage list error:', error);
      return { images: [], error: error.message };
    }

    // Convert to full URLs
    const images = data.map((file) => {
      const { data: publicUrlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(`${userId}/${file.name}`);
      return publicUrlData.publicUrl;
    });

    return { images, error: null };
  } catch (err) {
    console.error('Unexpected list error:', err);
    return { images: [], error: 'Failed to list images' };
  }
};

/**
 * Compress image before upload (optional optimization)
 * This would use expo-image-manipulator for compression
 */
export const compressImage = async (
  imageUri: string,
  quality: number = 0.8
): Promise<{ uri: string; error: string | null }> => {
  try {
    // Note: This requires expo-image-manipulator
    // For now, we'll just return the original URI
    // You can implement actual compression later if needed
    return { uri: imageUri, error: null };
  } catch (err) {
    return { uri: imageUri, error: 'Compression failed, using original' };
  }
};