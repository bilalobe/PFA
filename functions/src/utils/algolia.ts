import algoliasearch from 'algoliasearch';

// Initialize the Algolia client 
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

if (!appId || !apiKey) {
    throw new Error('Algolia environment variables are not defined.');
}

const searchClient = algoliasearch(
    appId,
    apiKey,
);

export { searchClient };