import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Import Apollo tools
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { getMainDefinition } from '@apollo/client/utilities';import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';


// TODO (A4): switch to HTTPS + WSS once encryption is implemented
const host = window.location.hostname;

// 1. Setup the standard HTTP connection (Queries & Mutations)
const httpLink = new HttpLink({
  uri: `http://${host}:3000/graphql`
});

// 2. Setup the WebSocket connection (Real-time Subscriptions)
const wsLink = new GraphQLWsLink(createClient({
  url: `ws://${host}:3000/graphql`,
}));

// 3. The "Traffic Cop" - Routes requests to HTTP or WebSockets automatically
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

// 4. Setup Apollo Cache with Infinite Scroll rules (Kept exactly as you had it)
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getFirms: {
          keyArgs: false,
          merge(existing = { data: [] }, incoming, { args }) {
            if (args?.page && args.page > 1) {
              return {
                ...incoming,
                data: [...existing.data, ...incoming.data],
              };
            }
            return incoming;
          },
        },
      },
    },
  },
});

// 5. Initialize the App
const client = new ApolloClient({
  link: splitLink,
  cache,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);