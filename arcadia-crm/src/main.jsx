import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const host = window.location.hostname;
const PROTOCOL = window.location.protocol === 'https:' ? 'https' : 'http';
const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss' : 'ws';

// VITE_API_URL is set at build time for cloud deploys (e.g. https://your-app.onrender.com).
// Falls back to localhost:3000 for local dev.
const API_BASE = import.meta.env.VITE_API_URL || `${PROTOCOL}://${host}:3000`;
const WS_BASE  = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/^https/, 'wss').replace(/^http/, 'ws')
  : `${WS_PROTOCOL}://${host}:3000`;

// 1. Auth link — injects Bearer token into every HTTP request
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('arcadia_token');
  operation.setContext(({ headers = {} }) => ({
    headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  }));
  return forward(operation);
});

// 2. HTTP link
const httpLink = new HttpLink({ uri: `${API_BASE}/graphql` });

// 3. WebSocket link — token passed in connectionParams
const wsLink = new GraphQLWsLink(createClient({
  url: `${WS_BASE}/graphql`,
  connectionParams: () => {
    const token = localStorage.getItem('arcadia_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
}));

// 4. Route subscriptions to WS, everything else to HTTP + auth
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  ApolloLink.from([authLink, httpLink]),
);

// 5. Cache with infinite-scroll merge policy
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getFirms: {
          keyArgs: false,
          merge(existing = { data: [] }, incoming, { args }) {
            if (args?.page && args.page > 1) {
              return { ...incoming, data: [...existing.data, ...incoming.data] };
            }
            return incoming;
          },
        },
      },
    },
  },
});

const client = new ApolloClient({ link: splitLink, cache });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
