import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostListener, NgZone, Output, output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ClickOutside]',
  standalone: false
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<any>();
  
  constructor(private elementRef: ElementRef, private cdref: ChangeDetectorRef) { }

  @HostListener('document:click', ['$event.target'])
  @HostListener('document:touchstart', ['$event.target'])
  public onClick(targetElement: HTMLElement): void {
    const clickin = this.elementRef.nativeElement.contains(targetElement);
    if (!clickin) {
      this.clickOutside.emit();
      this.cdref.detectChanges();
    }
  }
}
