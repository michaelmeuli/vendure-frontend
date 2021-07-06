// tslint:disable: directive-selector
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[pdfHost]',
})
export class PdfDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}


