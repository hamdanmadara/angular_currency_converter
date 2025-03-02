import { Component, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConversionResult } from '../../models/conversion.model';
import { StorageService } from '../../services/storage.service';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-conversion-history',
  standalone: true,
  imports: [
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './conversion-history.component.html',
  styleUrls: ['./conversion-history.component.scss']
})
export class ConversionHistoryComponent implements OnInit, OnDestroy {
  conversions: ConversionResult[] = [];
  private subscription: Subscription | null = null;
  
  displayedColumns: string[] = ['date', 'fromAmount', 'toAmount', 'rate'];

  constructor(
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.subscription = this.storageService.getConversions()
      .subscribe(conversions => {
        this.conversions = conversions;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Format the date for display
   * @param timestamp Timestamp to format
   */
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Clear all conversion history with confirmation
   */
  clearHistory(): void {
    // Ask for confirmation
    const confirmation = window.confirm('Are you sure you want to clear all conversion history?');
    
    if (confirmation) {
      this.storageService.clearConversions();
    }
  }
}