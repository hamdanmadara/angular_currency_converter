import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CurrencyResponse } from '../models/currency.model';
import { ConversionRequest, ConversionResult } from '../models/conversion.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all available currencies
   */
  getCurrencies(): Observable<CurrencyResponse> {
    return this.http.get<CurrencyResponse>(`${this.apiUrl}/currencies`);
  }

  /**
   * Get exchange rates for a base currency
   * @param baseCurrency Base currency code
   * @param targetCurrencies Target currency codes (comma-separated)
   */
  getExchangeRates(baseCurrency: string, targetCurrencies?: string): Observable<any> {
    let url = `${this.apiUrl}/rates?base=${baseCurrency}`;
    
    if (targetCurrencies) {
      url += `&currencies=${targetCurrencies}`;
    }
    
    return this.http.get<any>(url);
  }

  /**
   * Convert amount from one currency to another
   * @param conversionRequest Conversion details
   */
  convertCurrency(conversionRequest: ConversionRequest): Observable<ConversionResult> {
    return this.http.post<ConversionResult>(`${this.apiUrl}/convert`, conversionRequest);
  }
}