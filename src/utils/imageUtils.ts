export const compressImage = (file: File, maxSizeMB: number = 15): Promise<string> => {
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
      let quality = 1.0;
      let compressedDataUrl = '';
      
      do {
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeInMB = (compressedDataUrl.length * 3) / 4 / (1024 * 1024);
        
        if (sizeInMB <= maxSizeMB || quality <= 0.1) {
          break;
        }
        
        quality -= 0.1;
      } while (quality > 0.1);
      
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const saveImageToStorage = (imageData: string, imageId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Clean up old images if storage is getting full
      cleanupStorageIfNeeded();
      
      // Save the image with a versioned key to prevent conflicts
      const imageKey = `product_image_${imageId}_v${Date.now()}`;
      localStorage.setItem(imageKey, imageData);
      
      // Keep track of image keys for cleanup
      const imageKeys = JSON.parse(localStorage.getItem('image_keys') || '[]');
      imageKeys.push(imageKey);
      localStorage.setItem('image_keys', JSON.stringify(imageKeys));
      
      // Store the mapping from imageId to the actual storage key
      const imageMapping = JSON.parse(localStorage.getItem('image_mapping') || '{}');
      
      // Remove old mapping if exists
      if (imageMapping[imageId]) {
        localStorage.removeItem(imageMapping[imageId]);
      }
      
      imageMapping[imageId] = imageKey;
      localStorage.setItem('image_mapping', JSON.stringify(imageMapping));
      
      console.log('Image saved successfully:', imageKey);
      resolve();
    } catch (error) {
      console.error('Failed to save image:', error);
      reject(error);
    }
  });
};

export const getImageUrl = (imageId?: string): string | null => {
  if (!imageId) return null;
  
  try {
    // First check if it's already a data URL
    if (imageId.startsWith('data:')) {
      return imageId;
    }
    
    // Check if it's a file path (for backward compatibility)
    if (imageId.startsWith('/') || imageId.includes('.')) {
      return imageId;
    }
    
    // Get from storage using mapping
    const imageMapping = JSON.parse(localStorage.getItem('image_mapping') || '{}');
    const imageKey = imageMapping[imageId];
    
    if (imageKey) {
      const imageData = localStorage.getItem(imageKey);
      if (imageData) {
        return imageData;
      }
    }
    
    // Fallback: try direct access (for old storage method)
    const directImage = localStorage.getItem(`product_image_${imageId}`);
    if (directImage) {
      return directImage;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving image:', error);
    return null;
  }
};

export const deleteImageFromStorage = (imageId: string): void => {
  try {
    const imageMapping = JSON.parse(localStorage.getItem('image_mapping') || '{}');
    const imageKey = imageMapping[imageId];
    
    if (imageKey) {
      localStorage.removeItem(imageKey);
      delete imageMapping[imageId];
      localStorage.setItem('image_mapping', JSON.stringify(imageMapping));
      
      // Remove from image keys list
      const imageKeys = JSON.parse(localStorage.getItem('image_keys') || '[]');
      const updatedKeys = imageKeys.filter((key: string) => key !== imageKey);
      localStorage.setItem('image_keys', JSON.stringify(updatedKeys));
    }
    
    // Also try to remove old format
    localStorage.removeItem(`product_image_${imageId}`);
    
    console.log('Image deleted successfully:', imageId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

const cleanupStorageIfNeeded = (): void => {
  try {
    // Check available storage space
    const testKey = 'storage_test';
    const testData = 'x'.repeat(1024 * 1024); // 1MB test
    
    try {
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
    } catch {
      // Storage is full, cleanup old images
      console.log('Storage full, cleaning up old images...');
      
      const imageKeys = JSON.parse(localStorage.getItem('image_keys') || '[]');
      const imageMapping = JSON.parse(localStorage.getItem('image_mapping') || '{}');
      
      // Remove oldest 20% of images
      const imagesToRemove = Math.ceil(imageKeys.length * 0.2);
      
      for (let i = 0; i < imagesToRemove && i < imageKeys.length; i++) {
        const keyToRemove = imageKeys[i];
        localStorage.removeItem(keyToRemove);
        
        // Remove from mapping
        for (const [imageId, imageKey] of Object.entries(imageMapping)) {
          if (imageKey === keyToRemove) {
            delete imageMapping[imageId];
            break;
          }
        }
      }
      
      // Update stored arrays
      const remainingKeys = imageKeys.slice(imagesToRemove);
      localStorage.setItem('image_keys', JSON.stringify(remainingKeys));
      localStorage.setItem('image_mapping', JSON.stringify(imageMapping));
      
      console.log(`Cleaned up ${imagesToRemove} old images`);
    }
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
};

// Utility to check storage health
export const checkStorageHealth = (): void => {
  try {
    const imageKeys = JSON.parse(localStorage.getItem('image_keys') || '[]');
    const imageMapping = JSON.parse(localStorage.getItem('image_mapping') || '{}');
    
    console.log('Storage Health Check:');
    console.log(`- Total image keys: ${imageKeys.length}`);
    console.log(`- Total image mappings: ${Object.keys(imageMapping).length}`);
    
    // Check for orphaned data
    let orphanedKeys = 0;
    imageKeys.forEach((key: string) => {
      const exists = Object.values(imageMapping).includes(key);
      if (!exists) {
        orphanedKeys++;
        localStorage.removeItem(key); // Clean up orphaned data
      }
    });
    
    if (orphanedKeys > 0) {
      console.log(`- Cleaned up ${orphanedKeys} orphaned image keys`);
      // Update the image keys array
      const validKeys = imageKeys.filter((key: string) => 
        Object.values(imageMapping).includes(key)
      );
      localStorage.setItem('image_keys', JSON.stringify(validKeys));
    }
  } catch (error) {
    console.error('Error checking storage health:', error);
  }
};
