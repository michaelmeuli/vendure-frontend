import { Injectable } from '@angular/core';
import { NetworkStatus, WatchQueryFetchPolicy } from '@apollo/client/core';
import { isScullyGenerated, TransferStateService } from '@scullyio/ng-lib';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private readonly context = {
        headers: {},
    };

    constructor(
        private apollo: Apollo,
        private transferStateService: TransferStateService
    ) {}

    query<T = any, V = any>(
        query: DocumentNode,
        variables?: V,
        fetchPolicy?: WatchQueryFetchPolicy
    ): Observable<T> {
        if (isScullyGenerated()) {
            return this.transferStateService.getState<T>('appTranferState');
        }
        return this.apollo
            .watchQuery<T, V>({
                query,
                variables,
                context: this.context,
                fetchPolicy: fetchPolicy || 'cache-first',
            })
            .valueChanges.pipe(
                filter(
                    (result) => result.networkStatus === NetworkStatus.ready
                ),
                map((response) => response.data),
                tap((data) =>
                    this.transferStateService.setState<T>(
                        'appTranferState',
                        data
                    )
                )
            );
    }

    mutate<T = any, V = any>(
        mutation: DocumentNode,
        variables?: V
    ): Observable<T> {
        return this.apollo
            .mutate<T, V>({
                mutation,
                variables,
                context: this.context,
            })
            .pipe(map((response) => response.data as T));
    }
}
