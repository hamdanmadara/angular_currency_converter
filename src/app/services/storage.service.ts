import { Injectable } from '@angular/core';
import { ConversionResult } from '../models/conversion.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'currency_conversions';
  private conversionsSubject = new BehaviorSubject<ConversionResult[]>([]);
  
  constructor() {
    this.loadConversions();
  }

  /**
   * Get all saved conversions as an observable
   */
  getConversions(): Observable<ConversionResult[]> {
    return this.conversionsSubject.asObservable();
  }

  /**
   * Save a new conversion to the history
   * @param conversion The conversion result to save
   */
  saveConversion(conversion: ConversionResult): void {
    const conversions = this.conversionsSubject.value;
    
    // Add the new conversion at the beginning of the array
    const updatedConversions = [conversion, ...conversions];
    
    // Update local storage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedConversions));
    
    // Update the behavior subject
    this.conversionsSubject.next(updatedConversions);
  }

  /**
   * Clear all conversion history
   */
  clearConversions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.conversionsSubject.next([]);
  }

  /**
   * Load saved conversions from local storage
   */
  private loadConversions(): void {
    const savedConversions = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedConversions) {
      try {
        const conversions = JSON.parse(savedConversions) as ConversionResult[];
        this.conversionsSubject.next(conversions);
      } catch (error) {
        console.error('Error parsing saved conversions:', error);
        this.conversionsSubject.next([]);
      }
    }
  }
}