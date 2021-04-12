import { GetClientTokenQuery } from './../../../common/generated-types';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

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
    cardNumber: string;
    expMonth: number;
    expYear: number;
    paymentErrorMessage: string | undefined;
    activeOrderId: string;
    clientToken: string;

    constructor(private dataService: DataService,
        private stateService: StateService,
        private router: Router,
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.dataService.query<GetActiveOrderId.Query>(GET_ACTIVE_ORDER_ID).pipe(
            map(data => data.activeOrder?.id)).
            subscribe((activeOrderId) => {
                this.activeOrderId = activeOrderId as string;
                console.log('activeOrderId: ', this.activeOrderId);
                this.dataService.query<GetClientToken.Query, GetClientToken.Variables>(GET_CLIENT_TOKEN, {
                    orderId: this.activeOrderId
                }).subscribe((data) => {
                    this.clientToken = data.generateBraintreeClientToken;
                    console.log('clientToken: ', this.clientToken);
                });
            });
    }

    getMonths(): number[] {
        return Array.from({ length: 12 }).map((_, i) => i + 1);
    }

    getYears(): number[] {
        const year = new Date().getFullYear();
        return Array.from({ length: 10 }).map((_, i) => year + i);
    }

    completeOrder() {
        this.dataService.mutate<AddPayment.Mutation, AddPayment.Variables>(ADD_PAYMENT, {
            input: {
                method: 'example-payment-provider',
                metadata: {
                    foo: 'bar',
                },
            },
        })
            .subscribe(async ({ addPaymentToOrder }) => {
                switch (addPaymentToOrder?.__typename) {
                    case 'Order':
                        const order = addPaymentToOrder;
                        if (order && (order.state === 'PaymentSettled' || order.state === 'PaymentAuthorized')) {
                            await new Promise(resolve => setTimeout(() => {
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
