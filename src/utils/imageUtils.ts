
export const saveImageToPublic = async (file: File): Promise<string> => {
  // Create a unique filename with timestamp to avoid conflicts
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExtension}`;
  
  try {
    // First, let's try to compress the image if it's too large
    const compressedFile = await compressImage(file);
    
    // Convert file to base64
    const base64 = await fileToBase64(compressedFile);
    
    // Check if we have enough storage space
    const estimatedSize = base64.length * 2; // Rough estimate including JSON overhead
    const currentStorage = JSON.stringify(localStorage).length;
    const availableSpace = 5 * 1024 * 1024 - currentStorage; // Assume 5MB limit
    
    if (estimatedSize > availableSpace) {
      // Clean up old images to make space
      cleanupOldImages();
      
      // Check again after cleanup
      const newCurrentStorage = JSON.stringify(localStorage).length;
      const newAvailableSpace = 5 * 1024 * 1024 - newCurrentStorage;
      
      if (estimatedSize > newAvailableSpace) {
        throw new Error('Not enough storage space available. Please delete some products with images.');
      }
    }
    
    // Store in localStorage
    const imageData = {
      filename,
      data: base64,
      timestamp,
      size: estimatedSize
    };
    
    localStorage.setItem(`image_${filename}`, JSON.stringify(imageData));
    
    console.log(`Image saved successfully: ${filename} (${(estimatedSize / 1024).toFixed(1)} KB)`);
    
    return filename;
  } catch (error) {
    console.error('Error saving image:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('storage')) {
        throw new Error('Storage limit reached. Please delete some product images to free up space.');
      } else if (error.message.includes('quota')) {
        throw new Error('Browser storage quota exceeded. Please clear some data.');
      }
    }
    
    throw new Error('Failed to save image. Please try with a smaller image or contact support.');
  }
};

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1200px width/height)
      const maxSize = 1200;
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if compression fails
          }
        },
        'image/jpeg',
        0.8 // 80% quality
      );
    };
    
    img.onerror = () => resolve(file); // Fallback to original
    img.src = URL.createObjectURL(file);
  });
};

const cleanupOldImages = () => {
  const imageKeys = Object.keys(localStorage).filter(key => key.startsWith('image_'));
  
  // Sort by timestamp (oldest first)
  const sortedKeys = imageKeys.sort((a, b) => {
    try {
      const dataA = JSON.parse(localStorage.getItem(a) || '{}');
      const dataB = JSON.parse(localStorage.getItem(b) || '{}');
      return (dataA.timestamp || 0) - (dataB.timestamp || 0);
    } catch {
      return 0;
    }
  });
  
  // Remove oldest 25% of images
  const toRemove = Math.floor(sortedKeys.length * 0.25);
  for (let i = 0; i < toRemove; i++) {
    localStorage.removeItem(sortedKeys[i]);
    console.log(`Cleaned up old image: ${sortedKeys[i]}`);
  }
};

export const getImageUrl = (filename: string): string => {
  if (!filename) return '';
  
  try {
    // First try to get from localStorage
    const storedImage = localStorage.getItem(`image_${filename}`);
    if (storedImage) {
      const imageData = JSON.parse(storedImage);
      return imageData.data;
    }
  } catch (error) {
    console.error('Error retrieving image from storage:', error);
  }
  
  // Fallback to public folder path
  return `/images/${filename}`;
};

export const deleteImage = (filename: string): void => {
  if (filename) {
    try {
      localStorage.removeItem(`image_${filename}`);
      console.log(`Deleted image: ${filename}`);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const validateImageFile = (file: File): boolean => {
  // Check file size (15MB limit)
  const maxSize = 15 * 1024 * 1024; // 15MB in bytes
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 15MB');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
  }
  
  return true;
};

// Utility to check storage usage
export const getStorageInfo = () => {
  try {
    const storageSize = JSON.stringify(localStorage).length;
    const imageKeys = Object.keys(localStorage).filter(key => key.startsWith('image_'));
    const imageCount = imageKeys.length;
    
    let totalImageSize = 0;
    imageKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        totalImageSize += data.size || 0;
      } catch {}
    });
    
    return {
      totalStorageUsed: storageSize,
      imageCount,
      totalImageSize,
      availableSpace: Math.max(0, 5 * 1024 * 1024 - storageSize)
    };
  } catch {
    return {
      totalStorageUsed: 0,
      imageCount: 0,
      totalImageSize: 0,
      availableSpace: 5 * 1024 * 1024
    };
  }
};
