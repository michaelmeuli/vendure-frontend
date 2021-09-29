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

let { apiHost, apiPort, shopApiPath } = environment;

const client = new ApolloClient({
    link: new HttpLink({
        uri: `${apiHost}:${apiPort}/${shopApiPath}`
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
    console.log(products);
    return Promise.resolve(
        products.map((slug) => ({
            route: `/product/${slug}`,
        }))
    );
}

const validator = async (conf) => [];
registerPlugin('router', 'products', productPlugin, validator);
