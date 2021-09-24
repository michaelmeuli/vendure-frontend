import {gql} from 'apollo-angular';

export const GET_PRODUCTS = gql`
    query GetProducts {
        products {
            items {
                slug
            }
        }
    }
`;