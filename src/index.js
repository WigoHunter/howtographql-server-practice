import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import schema from './schema';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import connectMongo from './mongo-connector';
import { authenticate } from './authentication';
import dataloaders from './dataloaders';
import formatError from './formatError';

const start = async () => {
    const mongo = await connectMongo();

    var app = express();
    var PORT = 3000;

    const buildOptions = async (req, res) => {
        const user = await authenticate(req, mongo.Users);
        return {
            context: {
                dataloaders: dataloaders(mongo),
                mongo,
                user
            },
            formatError,
            schema,
        };
    };
    
    app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
        passHeader: `'Authorization': 'bearer token-foo@bar.com'`,
        subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
    }));

    const server = createServer(app);

    server.listen(PORT, () => {
        SubscriptionServer.create(
            {execute, subscribe, schema},
            {server, path: '/subscriptions'},
        );

        console.log(`GraphQL server running on port ${PORT}`);
    });
};

start();