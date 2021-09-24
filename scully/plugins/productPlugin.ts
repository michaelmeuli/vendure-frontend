import { HandledRoute, registerPlugin } from '@scullyio/scully';
import { GetProducts } from '../../src/app/common/generated-types';
import { map } from 'rxjs/operators';
import { DataService } from '../../src/app/core/providers/data/data.service';
import { GET_PRODUCTS } from './productPlugin.graphql';
import {
    ApolloClient,
    ApolloLink,
    concat,
    gql,
    HttpLink,
    InMemoryCache,
} from '@apollo/client/core';
import { environment } from '../../src/environments/environment.prod';

let { apiHost, apiPort, shopApiPath } = environment;

const client = new ApolloClient({
    link: new HttpLink({
        uri: `${apiHost}:${apiPort}/${shopApiPath}`,
        fetch,
    }),
    cache: new InMemoryCache(),
});

function productPlugin(route: string, config = {}): Promise<HandledRoute[]> {
    return Promise.resolve([
        { route: '/product/bergamotte-15ml' },
        { route: '/product/basilikum-15ml' },
        { route: '/product/lebensbaum-5ml' },
        { route: '/product/schwarzer-pfeffer-5ml' },
        { route: '/product/schwarzfichte-5ml' },
        { route: '/product/blauer-rainfarn-5ml' },
    ]);
}

function productPlugin3(dataService: DataService): Promise<HandledRoute[]> {
    let routes: any;
    dataService
        .query<GetProducts.Query>(GET_PRODUCTS)
        .pipe(
            map((data) => data.products.items),
            map((item) => ({
                route: `/product/${item}`,
            }))
        )
        .subscribe((items) => (routes = items));
    console.log(routes);
    return Promise.resolve(routes);
}

let routes: any;
function productPlugin4(dataService: DataService) {
    dataService.query<GetProducts.Query>(GET_PRODUCTS).subscribe((data) => {
        routes = data.products.items;
    });
    console.log(routes);
}

function productPlugin5(route: string, config = {}): Promise<HandledRoute[]> {
    return Promise.resolve(
        routes.map((slug) => ({
            route: `/product/${slug}`,
        }))
    );
}

async function productPlugin6(
    route: string,
    config = {}
): Promise<HandledRoute[]> {
    const {
        data: { products },
    } = await client.query({
        query: GET_PRODUCTS,
    });
    console.log(products);
    return Promise.resolve(
        products.map((slug) => ({
            route: `/product/${slug}`,
        }))
    );
}

const validator = async (conf) => [];
registerPlugin('router', 'products', productPlugin6, validator);
