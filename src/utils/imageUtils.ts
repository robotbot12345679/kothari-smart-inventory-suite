
export const saveImageToPublic = async (file: File): Promise<string> => {
  // Create a unique filename with timestamp to avoid conflicts
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExtension}`;
  
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // In a real environment, you would send this to a server endpoint
    // For now, we'll use localStorage to store the base64 data and serve it via URL
    const imageData = {
      filename,
      data: base64,
      timestamp
    };
    
    // Store in localStorage with a special prefix
    localStorage.setItem(`image_${filename}`, JSON.stringify(imageData));
    
    // Return the filename to be stored with the product
    return filename;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
};

export const getImageUrl = (filename: string): string => {
  if (!filename) return '';
  
  // First try to get from localStorage
  const storedImage = localStorage.getItem(`image_${filename}`);
  if (storedImage) {
    const imageData = JSON.parse(storedImage);
    return imageData.data;
  }
  
  // Fallback to public folder path
  return `/images/${filename}`;
};

export const deleteImage = (filename: string): void => {
  if (filename) {
    localStorage.removeItem(`image_${filename}`);
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
