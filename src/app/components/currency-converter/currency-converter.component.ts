import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Project Components & Directives
import { LoaderComponent } from '../loader/loader.component';
import { NumberOnlyDirective } from '../../directives/number-only.directive';
import { ConversionHistoryComponent } from '../conversion-history/conversion-history.component';

// Models & Services
import { Currency } from '../../models/currency.model';
import { ConversionRequest } from '../../models/conversion.model';
import { CurrencyService } from '../../services/currency.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LoaderComponent,
    NumberOnlyDirective,
    ConversionHistoryComponent
  ],
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit {
  convertForm!: FormGroup;
  currencies: { code: string; name: string }[] = [];
  isLoadingCurrencies = false;
  isConverting = false;
  conversionResult: number | null = null;
  conversionRate: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private currencyService: CurrencyService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCurrencies();
  }

  /**
   * Initialize the conversion form
   */
  initForm(): void {
    this.convertForm = this.fb.group({
      amount: [1, [Validators.required, Validators.min(0.01)]],
      fromCurrency: ['USD', Validators.required],
      toCurrency: ['EUR', Validators.required]
    });
  }

  /**
   * Load available currencies from the API
   */
  loadCurrencies(): void {
    this.isLoadingCurrencies = true;
    this.currencyService.getCurrencies()
      .pipe(
        finalize(() => {
          this.isLoadingCurrencies = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.currencies = Object.entries(response.data).map(([code, currency]) => ({
            code,
            name: `${code} - ${currency.name}`
          }));
          
          // Sort currencies alphabetically by code
          this.currencies.sort((a, b) => a.code.localeCompare(b.code));
        },
        error: (error) => {
          console.error('Error loading currencies:', error);
          this.errorMessage = 'Failed to load currencies. Please try again later.';
        }
      });
  }

  /**
   * Swap the 'from' and 'to' currencies
   */
  swapCurrencies(): void {
    const currentValues = this.convertForm.value;
    this.convertForm.patchValue({
      fromCurrency: currentValues.toCurrency,
      toCurrency: currentValues.fromCurrency
    });
    
    // Clear the previous result
    this.conversionResult = null;
    this.conversionRate = null;
  }

  /**
   * Submit the form and convert the currency
   */
  onSubmit(): void {
    if (this.convertForm.invalid) {
      this.markFormGroupTouched(this.convertForm);
      return;
    }

    const { amount, fromCurrency, toCurrency } = this.convertForm.value;
    
    // Check if from and to currencies are the same
    if (fromCurrency === toCurrency) {
      this.conversionResult = amount;
      this.conversionRate = 1;
      return;
    }

    const request: ConversionRequest = {
      from: fromCurrency,
      to: toCurrency,
      amount: amount
    };

    this.isConverting = true;
    this.errorMessage = null;

    this.currencyService.convertCurrency(request)
      .pipe(
        finalize(() => {
          this.isConverting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.conversionResult = response.result;
          this.conversionRate = response.rate;
          
          // Save to conversion history
          this.storageService.saveConversion(response);
        },
        error: (error) => {
          console.error('Error converting currency:', error);
          this.errorMessage = 'Failed to convert currency. Please try again later.';
        }
      });
  }

  /**
   * Recursively marks all controls in a form group as touched
   * @param formGroup Form group to mark touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}