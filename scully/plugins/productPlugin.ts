import { HandledRoute, registerPlugin } from '@scullyio/scully';
import { GET_PRODUCTS } from './productPlugin.graphql';

import fetch from 'cross-fetch';
// Or just: import 'cross-fetch/polyfill';

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
        fetch: fetch,
    }),
    cache: new InMemoryCache(),
});

fetch('//api.github.com/users/lquixada')
    .then((res) => {
        if (res.status >= 400) {
            throw new Error('Bad response from server');
        }
        return res.json();
    })
    .then((user) => {
        console.log(user);
    })
    .catch((err) => {
        console.error(err);
    });

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
        products.map((product) => ({
            route: `/product/${product.slug}`,
        }))
    );
}

const validator = async (conf) => [];
registerPlugin('router', 'products', productPlugin, validator);
