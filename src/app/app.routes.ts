import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'converter'
  },
  {
    path: 'converter',
    loadComponent: () => import('./components/currency-converter/currency-converter.component').then(m => m.CurrencyConverterComponent)
  }
];