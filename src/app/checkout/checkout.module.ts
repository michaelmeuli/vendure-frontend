import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { routes } from './checkout.routes';
import { CheckoutConfirmationComponent } from './components/checkout-confirmation/checkout-confirmation.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { CheckoutProcessComponent } from './components/checkout-process/checkout-process.component';
import { CheckoutShippingComponent } from './components/checkout-shipping/checkout-shipping.component';
import { CheckoutSignInComponent } from './components/checkout-sign-in/checkout-sign-in.component';
import { CheckoutStageIndicatorComponent } from './components/checkout-stage-indicator/checkout-stage-indicator.component';
import { PdfDirective } from './components/checkout-confirmation/pdf.directive';

import { PdfViewerModule } from 'ng2-pdf-viewer';

const DECLARATIONS = [
    CheckoutConfirmationComponent,
    CheckoutPaymentComponent,
    CheckoutShippingComponent,
    CheckoutSignInComponent,
    CheckoutProcessComponent,
    CheckoutStageIndicatorComponent,
    PdfDirective
];

@NgModule({
    declarations: DECLARATIONS,
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        PdfViewerModule
    ],
})
export class CheckoutModule {
}
