import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import {
    filter,
    map,
    mergeMap,
    shareReplay,
    switchMap,
    take,
} from 'rxjs/operators';
import SwissQRBill from 'swissqrbill/lib/browser';

import { REGISTER } from '../../../account/components/register/register.graphql';
import { GetOrderByCode, Register } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';

import { GET_ORDER_BY_CODE } from './checkout-confirmation.graphql';

@Component({
    selector: 'vsf-checkout-confirmation',
    templateUrl: './checkout-confirmation.component.html',
    styleUrls: ['./checkout-confirmation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutConfirmationComponent implements OnInit {
    registrationSent = false;
    order$: Observable<GetOrderByCode.OrderByCode>;
    notFound$: Observable<boolean>;
    method: string;
    pdfUrl$ = new BehaviorSubject<string>('');
   
    constructor(
        private dataService: DataService,
        private changeDetector: ChangeDetectorRef,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        const orderRequest$ = this.route.paramMap.pipe(
            map((paramMap) => paramMap.get('code')),
            filter(notNullOrUndefined),
            switchMap((code) =>
                this.dataService.query<
                    GetOrderByCode.Query,
                    GetOrderByCode.Variables
                >(GET_ORDER_BY_CODE, { code })
            ),
            map((data) => data.orderByCode),
            shareReplay(1)
        );
        this.order$ = orderRequest$.pipe(filter(notNullOrUndefined));
        this.notFound$ = orderRequest$.pipe(map((res) => !res));
        this.route.queryParams.subscribe((params) => {
            this.method = params['method'];
        });

        if (this.method === 'swissqrinvoice') {
            this.order$
                .pipe(
                    take(1),
                    map((order) => {
                        const data: SwissQRBill.data = {
                            currency: 'CHF',
                            amount: order.totalWithTax / 100,
                            additionalInformation: order.code,
                            creditor: {
                                name: 'Jessica Meuli',
                                address: 'Sonnenhaldenstrasse 5',
                                zip: 8360,
                                city: 'Wallenwil',
                                account: 'CH14 0078 1612 4519 5200 2',
                                country: 'CH',
                            },
                            debtor: {
                                name:
                                    order.shippingAddress?.fullName ||
                                    'Muster Hans',
                                address:
                                    order.shippingAddress?.streetLine1 ||
                                    'Musterstrasse 7',
                                zip: order.shippingAddress?.postalCode || 1000,
                                city:
                                    order.shippingAddress?.city ||
                                    'Musterstadt',
                                country:
                                    order.shippingAddress?.countryCode || 'CH',
                            },
                        };
                        return data;
                    })
                )
                .subscribe((data) => {
                    const stream = new (SwissQRBill.BlobStream as any)();
                    const pdf = new SwissQRBill.PDF(data, stream);
                    pdf.on('finish', () => {
                        const qrPdfUrl = stream.toBlobURL('application/pdf');
                        this.pdfUrl$.next(qrPdfUrl);
                    });
                });
        }
    }

    register() {
        this.order$
            .pipe(
                take(1),
                mergeMap((order) => {
                    const customer = order?.customer;
                    if (customer) {
                        return this.dataService.mutate<
                            Register.Mutation,
                            Register.Variables
                        >(REGISTER, {
                            input: {
                                emailAddress: customer.emailAddress,
                                firstName: customer.firstName,
                                lastName: customer.lastName,
                            },
                        });
                    } else {
                        return of({});
                    }
                })
            )
            .subscribe(() => {
                this.registrationSent = true;
                this.changeDetector.markForCheck();
            });
    }
}
