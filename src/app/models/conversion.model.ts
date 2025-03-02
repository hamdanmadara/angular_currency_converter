export interface ConversionRequest {
    from: string;
    to: string;
    amount: number;
  }
  
  export interface ConversionResult {
    from: string;
    to: string;
    amount: number;
    result: number;
    rate: number;
    timestamp: number;
  }