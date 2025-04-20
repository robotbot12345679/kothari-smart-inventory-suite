
import { useState } from 'react';

export const useUniqueId = (prefix: string = '') => {
  const [id] = useState(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}-${random}`;
  });
  
  return id;
};
