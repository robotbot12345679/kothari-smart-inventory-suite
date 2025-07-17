
export const formatIndianNumber = (amount: number): string => {
  // Convert to string and split by decimal point
  const parts = amount.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1] : '';
  
  // Apply Indian numbering system (lakhs, crores)
  let formattedInteger = '';
  const length = integerPart.length;
  
  if (length <= 3) {
    formattedInteger = integerPart;
  } else if (length <= 5) {
    // Thousands
    formattedInteger = integerPart.slice(0, length - 3) + ',' + integerPart.slice(length - 3);
  } else if (length <= 7) {
    // Lakhs
    formattedInteger = integerPart.slice(0, length - 5) + ',' + 
                     integerPart.slice(length - 5, length - 3) + ',' + 
                     integerPart.slice(length - 3);
  } else {
    // Crores and above
    const crores = integerPart.slice(0, length - 7);
    const lakhs = integerPart.slice(length - 7, length - 5);
    const thousands = integerPart.slice(length - 5, length - 3);
    const hundreds = integerPart.slice(length - 3);
    
    formattedInteger = crores + ',' + lakhs + ',' + thousands + ',' + hundreds;
  }
  
  return formattedInteger + decimalPart;
};

export const formatCurrency = (amount: number): string => {
  return '₹' + formatIndianNumber(amount);
};
