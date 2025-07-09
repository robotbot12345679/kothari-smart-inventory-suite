
export interface BillData {
  supplierName: string;
  billNumber: string;
  billDate: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalPrice: number;
  }>;
  subtotal: number;
  gst: number;
  total: number;
}

export interface PaymentData {
  amount: number;
  date: string;
  referenceNumber?: string;
  paymentMode?: string;
}

class AIDetectionService {
  // Enhanced bill detection with better patterns
  async detectBillData(file: File): Promise<BillData> {
    console.log('Starting enhanced AI bill detection for:', file.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Enhanced mock data with more realistic patterns
    const mockSupplierNames = [
      "ABC Traders & Co.",
      "Global Suppliers Ltd.",
      "Premium Food Corp",
      "Delhi Wholesale Market",
      "Mumbai Trading House",
      "Fresh Produce Suppliers"
    ];
    
    const mockProducts = [
      { name: "Basmati Rice Premium", basePrice: 120, unit: "kg" },
      { name: "Almonds California", basePrice: 850, unit: "kg" },
      { name: "Cashew Nuts W240", basePrice: 1400, unit: "kg" },
      { name: "Dates Medjool", basePrice: 650, unit: "kg" },
      { name: "Pistachios Iranian", basePrice: 2200, unit: "kg" },
      { name: "Walnuts Chilean", basePrice: 1800, unit: "kg" },
      { name: "Raisins Golden", basePrice: 450, unit: "kg" },
      { name: "Figs Turkish", basePrice: 950, unit: "kg" },
      { name: "Apricots Dried", basePrice: 750, unit: "kg" },
      { name: "Prunes Californian", basePrice: 680, unit: "kg" }
    ];
    
    // Generate realistic bill number
    const billNumber = `INV/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    
    // Generate realistic date (within last 30 days)
    const randomDays = Math.floor(Math.random() * 30);
    const billDate = new Date();
    billDate.setDate(billDate.getDate() - randomDays);
    
    // Generate 3-8 items for the bill
    const itemCount = Math.floor(Math.random() * 6) + 3;
    const items = [];
    let subtotal = 0;
    
    for (let i = 0; i < itemCount; i++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const quantity = Math.floor(Math.random() * 50) + 1;
      const priceVariation = 0.8 + (Math.random() * 0.4); // ±20% price variation
      const pricePerUnit = Math.round(product.basePrice * priceVariation);
      const totalPrice = quantity * pricePerUnit;
      
      items.push({
        productName: product.name,
        quantity,
        unit: product.unit,
        pricePerUnit,
        totalPrice
      });
      
      subtotal += totalPrice;
    }
    
    // Calculate GST (18% for most food items)
    const gstRate = Math.random() > 0.3 ? 0.18 : 0.12; // 18% or 12% GST
    const gst = Math.round(subtotal * gstRate);
    const total = subtotal + gst;
    
    const detectedData: BillData = {
      supplierName: mockSupplierNames[Math.floor(Math.random() * mockSupplierNames.length)],
      billNumber,
      billDate: billDate.toISOString().split('T')[0],
      items,
      subtotal,
      gst,
      total
    };
    
    console.log('Enhanced AI detected bill data:', detectedData);
    return detectedData;
  }
  
  // Enhanced payment detection
  async detectPaymentData(file: File): Promise<PaymentData> {
    console.log('Starting enhanced AI payment detection for:', file.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic payment amounts
    const baseAmounts = [5000, 10000, 15000, 25000, 50000, 75000, 100000];
    const baseAmount = baseAmounts[Math.floor(Math.random() * baseAmounts.length)];
    const variation = 0.85 + (Math.random() * 0.3); // ±15% variation
    const amount = Math.round(baseAmount * variation);
    
    // Generate realistic date (within last 7 days)
    const randomDays = Math.floor(Math.random() * 7);
    const paymentDate = new Date();
    paymentDate.setDate(paymentDate.getDate() - randomDays);
    
    // Generate realistic reference numbers based on payment mode
    const paymentModes = ['Online', 'Cheque', 'Bank Transfer', 'Cash'];
    const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
    
    let referenceNumber: string | undefined;
    if (paymentMode !== 'Cash') {
      const prefixes = {
        'Online': 'UPI',
        'Cheque': 'CHQ',
        'Bank Transfer': 'NEFT'
      };
      const prefix = prefixes[paymentMode as keyof typeof prefixes] || 'TXN';
      referenceNumber = `${prefix}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    const detectedData: PaymentData = {
      amount,
      date: paymentDate.toISOString().split('T')[0],
      referenceNumber,
      paymentMode
    };
    
    console.log('Enhanced AI detected payment data:', detectedData);
    return detectedData;
  }
  
  // Detect multiple bills from ZIP or multiple files
  async detectMultipleBills(files: File[]): Promise<BillData[]> {
    console.log(`Processing ${files.length} files for bill detection`);
    
    const results: BillData[] = [];
    
    for (const file of files) {
      try {
        const billData = await this.detectBillData(file);
        results.push(billData);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }
    
    return results;
  }
}

export const aiDetectionService = new AIDetectionService();
