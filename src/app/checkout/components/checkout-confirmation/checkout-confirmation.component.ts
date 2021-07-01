import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnInit,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
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
import { StateService } from '../../../core/providers/state/state.service';

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
    @ViewChild('bill', { static: false }) bill: ElementRef;
    saveQrPdfUrl: SafeResourceUrl;

    constructor(
        private stateService: StateService,
        private dataService: DataService,
        private changeDetector: ChangeDetectorRef,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: Document
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
                            amount: 1199.95,
                            additionalInformation: 'ordernummer',
                            creditor: {
                                name: 'Jessica Meuli',
                                address: 'Sonnenhaldenstrasse 5',
                                zip: 8360,
                                city: 'Wallenwil',
                                account: 'CH14 0078 1612 4519 5200 2',
                                country: 'CH',
                            },
                            debtor: {
                                name: order.customer?.firstName || 'Muster',
                                address: 'Grosse Marktgasse 28',
                                zip: 9400,
                                city: 'Rorschach',
                                country: 'CH',
                            },
                        };
                        return data;
                    })
                )
                .subscribe((data) => {
                    console.log(data);
                    const stream = new (SwissQRBill.BlobStream as any)();
                    const pdf = new SwissQRBill.PDF(data, stream);
                    pdf.on('finish', () => {
                        const iframe = document.getElementById(
                            'iframe'
                        ) as HTMLIFrameElement;
                        const qrPdfUrl = stream.toBlobURL('application/pdf');
                        const optionsQrPdfUrl = qrPdfUrl + '#toolbar=0&navpanes=1&scrollbar=0'
                        iframe.src = optionsQrPdfUrl;
                        console.log(this.saveQrPdfUrl);
                        console.log('PDF has been successfully created.');
                    });
                });
        }
    }

    createBillElement(): boolean {
        if (this.saveQrPdfUrl) {
            const iframe = this.renderer.createElement('iframe');
            iframe.src = this.saveQrPdfUrl;
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            this.renderer.appendChild(this.bill, iframe);
            return true;
        } else {
            return false;
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
