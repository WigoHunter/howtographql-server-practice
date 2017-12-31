import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import schema from './schema';

import connectMongo from './mongo-connector';
import { authenticate } from './authentication';
import { userLoader } from './dataloaders'

const start = async () => {
    const mongo = await connectMongo();

    var app = express();

    const buildOptions = async (req, res) => {
        const user = await authenticate(req, mongo.Users);
        return {
            context: {
                dataloaders: userLoader(mongo),
                mongo,
                user
            },
            schema,
        };
    };
    
    app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
        passHeader: `'Authorization': 'bearer token-foo@bar.com'`,
    }));

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`GraphQL server running on port ${PORT}`);
    });
};

start();