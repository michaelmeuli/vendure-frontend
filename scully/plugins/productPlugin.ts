import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { HandledRoute, registerPlugin } from '@scullyio/scully';

import { GET_PRODUCTS } from './productPlugin.graphql';
import { environment } from '../../src/environments/environment';
import fetch from 'cross-fetch';

let { apiHost, apiPort, shopApiPath } = environment;

const client = new ApolloClient({
    link: new HttpLink({
        uri: `${apiHost}:${apiPort}/${shopApiPath}`,
        fetch: fetch,
    }),
    cache: new InMemoryCache(),
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
    return Promise.resolve(
        products.items.map((product) => ({
            route: `/product/${product.slug}`,
        }))
    );
}

const validator = async (conf) => [];
registerPlugin('router', 'products', productPlugin, validator);
