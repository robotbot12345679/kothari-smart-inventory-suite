import { supabase } from '@/integrations/supabase/client';

export const compressImage = (file: File, maxSizeMB: number = 15): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions while maintaining aspect ratio
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      
      let { width, height } = img;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Try different quality levels until we get under the size limit
      let quality = 0.9;
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): void => {
  const maxSize = 15 * 1024 * 1024; // 15MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Please select an image under 15MB.');
  }
};

export const saveImageToPublic = async (file: File): Promise<string> => {
  try {
    validateImageFile(file);
    
    // Compress the image
    const compressedFile = await compressImage(file, 2);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}_${randomId}.${ext}`;
    
    // Save to Supabase Storage
    const url = await saveImageToStorage(compressedFile, filename);
    
    return url;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  await deleteImageFromStorage(imageUrl);
};

export const saveImageToStorage = async (file: File, filename: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename);
  
  return publicUrl;
};

export const getImageUrl = (imageUrl?: string): string | null => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // For backward compatibility with old data URLs
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // For old file paths
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  return imageUrl;
};

export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract filename from URL if it's a Supabase URL
    if (imageUrl.includes('product-images')) {
      const filename = imageUrl.split('/product-images/').pop();
      
      if (filename) {
        const { error } = await supabase.storage
          .from('product-images')
          .remove([filename]);
        
        if (error) {
          console.error('Error deleting image:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
