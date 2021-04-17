import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as dropin from 'braintree-web-drop-in';
import { PaymentMethodPayload } from 'braintree-web-drop-in';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { AddPayment, GetActiveOrderId, GetClientToken } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { ADD_PAYMENT } from './checkout-payment.graphql';
import { GET_ACTIVE_ORDER_ID, GET_CLIENT_TOKEN } from './checkout-payment.graphql';

@Component({
    selector: 'vsf-checkout-payment',
    templateUrl: './checkout-payment.component.html',
    styleUrls: ['./checkout-payment.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPaymentComponent implements OnInit {
    paymentErrorMessage: string | undefined;
    clientToken: string;
    dropinInstance: any;
    activeOrderId$: Observable<string | undefined>;

    constructor(private dataService: DataService,
        private stateService: StateService,
        private router: Router,
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.activeOrderId$ = this.dataService.query<GetActiveOrderId.Query>(GET_ACTIVE_ORDER_ID).pipe(
            map(data => data.activeOrder && data.activeOrder.id)
        );

        this.activeOrderId$.pipe(
            switchMap(activeOrderId => this.dataService.query<GetClientToken.Query, GetClientToken.Variables>(GET_CLIENT_TOKEN, {
                orderId: activeOrderId as string
            })),
            take(1)
        ).subscribe(data => {
            this.clientToken = data.generateBraintreeClientToken;
            dropin.create({
                authorization: this.clientToken,
                container: '#dropin-container',
            }).then((dropinInstance: any)  => this.dropinInstance = dropinInstance);
        });
    }

    completeOrder() {
        this.dropinInstance.requestPaymentMethod().then((paymentResult: PaymentMethodPayload) => this.completeOrderMutation(paymentResult));
    }

    completeOrderMutation(paymentResult: PaymentMethodPayload) {
        this.dataService.mutate<AddPayment.Mutation, AddPayment.Variables>(ADD_PAYMENT, {
            input: {
                method: 'braintree',
                metadata: paymentResult
            },
        })
            .subscribe(async ({ addPaymentToOrder }) => {
                switch (addPaymentToOrder?.__typename) {
                    case 'Order':
                        const order = addPaymentToOrder;
                        if (order && (order.state === 'PaymentSettled' || order.state === 'PaymentAuthorized')) {
                            await new Promise<void>(resolve => setTimeout(() => {
                                this.stateService.setState('activeOrderId', null);
                                resolve();
                            }, 500));
                            this.router.navigate(['../confirmation', order.code], { relativeTo: this.route });
                        }
                        break;
                    case 'OrderPaymentStateError':
                    case 'PaymentDeclinedError':
                    case 'PaymentFailedError':
                    case 'OrderStateTransitionError':
                        this.paymentErrorMessage = addPaymentToOrder.message;
                        break;
                }

            });
    }
}
