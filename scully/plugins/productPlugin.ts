// https://strapi.io/blog/how-to-build-a-jamstack-app-with-scully-io
// https://github.com/asotog/scully-strapi-tutorial

import { HandledRoute, registerPlugin } from '@scullyio/scully';
import { GET_PRODUCTS } from './productPlugin.graphql';
import {
    ApolloClient,
    ApolloLink,
    concat,
    gql,
    HttpLink,
    InMemoryCache,
} from '@apollo/client';
import { environment } from '../../src/environments/environment.prod';
import fetch from 'cross-fetch';

let { apiHost, apiPort, shopApiPath } = environment;

const client = new ApolloClient({
    link: new HttpLink({
        uri: `${apiHost}:${apiPort}/${shopApiPath}`,
        fetch: fetch
    }),
    cache: new InMemoryCache(),
});


function productPluginOld(route: string, config = {}): Promise<HandledRoute[]> {
    return Promise.resolve([
        { route: '/product/bergamotte-15ml' },
        { route: '/product/basilikum-15ml' },
        { route: '/product/lebensbaum-5ml' },
        { route: '/product/schwarzer-pfeffer-5ml' },
        { route: '/product/schwarzfichte-5ml' },
        { route: '/product/blauer-rainfarn-5ml' },
    ]);
}

export const products = 'products';

async function productPlugin(
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
registerPlugin('router', products, productPlugin, validator);
