
import { ClickOutsideDirective } from './click-outside.directive';

describe('ClickOutsideDirective', () => {
  it('should create an instance', () => {
    //const mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    const directive = new ClickOutsideDirective({nativeElement:[]}, undefined);
    expect(directive).toBeTruthy();
  });
});
