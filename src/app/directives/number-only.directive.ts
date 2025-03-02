import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumberOnly]',
  standalone: true 
})
export class NumberOnlyDirective {
  // Allowed keys (numbers, backspace, tab, delete, decimal point, arrow keys)
  private allowedKeys = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 
    'Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', '.', 'Enter'
  ];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    // Allow only one decimal point
    if (event.key === '.' && this.el.nativeElement.value.includes('.')) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event']) 
  onPaste(event: ClipboardEvent) {
    // Get the pasted text
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    
    // Check if pasted text is a valid number
    if (!/^[0-9]*\.?[0-9]*$/.test(pastedText)) {
      event.preventDefault();
    }
  }
}