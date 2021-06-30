import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, of } from "rxjs";
import {
    filter,
    map,
    mergeMap,
    shareReplay,
    switchMap,
    take,
} from "rxjs/operators";
import SwissQRBill from "swissqrbill/lib/browser";

import { REGISTER } from "../../../account/components/register/register.graphql";
import { GetOrderByCode, Register } from "../../../common/generated-types";
import { notNullOrUndefined } from "../../../common/utils/not-null-or-undefined";
import { DataService } from "../../../core/providers/data/data.service";
import { StateService } from "../../../core/providers/state/state.service";

import { GET_ORDER_BY_CODE } from "./checkout-confirmation.graphql";

@Component({
    selector: "vsf-checkout-confirmation",
    templateUrl: "./checkout-confirmation.component.html",
    styleUrls: ["./checkout-confirmation.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutConfirmationComponent implements OnInit {
    registrationSent = false;
    order$: Observable<GetOrderByCode.OrderByCode>;
    notFound$: Observable<boolean>;
    method: string;
    qrPdfUrl: string;
    saveQrPdfUrl: SafeResourceUrl;

    constructor(
        private stateService: StateService,
        private dataService: DataService,
        private changeDetector: ChangeDetectorRef,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit() {
        const orderRequest$ = this.route.paramMap.pipe(
            map((paramMap) => paramMap.get("code")),
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

        const data: SwissQRBill.data = {
            currency: "CHF",
            amount: 1199.95,
            reference: "210000000003139471430009017",
            creditor: {
                name: "Robert Schneider AG",
                address: "Rue du Lac 1268",
                zip: 2501,
                city: "Biel",
                account: "CH4431999123000889012",
                country: "CH",
            },
            debtor: {
                name: "Pia-Maria Rutschmann-Schnyder",
                address: "Grosse Marktgasse 28",
                zip: 9400,
                city: "Rorschach",
                country: "CH",
            },
        };

        const stream = new (SwissQRBill.BlobStream as any)();

        const pdf = new SwissQRBill.PDF(data, stream);

        pdf.on('finish', () => {
            this.qrPdfUrl = stream.toBlobURL('application/pdf');
            this.saveQrPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.qrPdfUrl+'#toolbar=0&navpanes=0&scrollbar=1');
            console.log('PDF has been successfully created.');
        });
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
