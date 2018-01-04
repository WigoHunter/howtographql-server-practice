import { ObjectID } from 'mongodb';
import validUrl from 'valid-url';

import pubsub from '../pubsub';

class ValidationError extends Error {
    constructor(msg, field) {
        super(msg);
        this.field = field;
    }
}

const assertValidLink = ({ url }) => {
    if (!validUrl.isUri(url)) {
        throw new ValidationError("Link validation error: invalid url.", "url");
    }
}

module.exports = {
    Query: {
        allLinks: async (root, data, { mongo: { Links } }) => {
            return await Links.find({}).toArray();
        },

        allUsers: async (root, data, { mongo: { Users } }) => {
            return await Users.find({}).toArray();
        },

        allVotes: async (root, data, { mongo: { Votes } }) => {
            return await Votes.find({}).toArray();
        },  
    },

    Mutation: {
        createLink: async (root, data, { mongo: { Links }, user }) => {
            assertValidLink(data);
            const newLink = Object.assign({ postedById: user && user._id }, data);
            const response = await Links.insert(newLink);

            newLink.id = response.insertedIds[0];
            pubsub.publish('Link', {
                Link: {
                    mutation: 'CREATED',
                    node: newLink,
                }
            });

            return newLink;
        },

        createUser: async (root, data, { mongo: { Users } }) => {
            const newUser = {
                name: data.name,
                email: data.authProvider.email.email,
                password: data.authProvider.email.password,
            };

            const response = await Users.insert(newUser);
            return Object.assign({ id: response.insertedIds[0] }, newUser);
        },

        createVote: async (root, data, { mongo: { Votes }, user }) => {
            const newVote = {
                userId: user && user._id,
                linkId: new ObjectID(data.linkId),
            };

            const response = await Votes.insert(newVote);
            return Object.assign({ id: response.insertedIds[0] }, newVote);
        },

        signinUser: async (root, data, { mongo: { Users } }) => {
            const user = await Users.findOne({ email: data.email.email });
            if (data.email.password === user.password) {
                return {
                    token: `token-${user.email}`,
                    user
                };
            }
        },
    },

    Link: {
        id: root => root._id || root.id,

        postedBy: async ({ postedById }, data, { dataloaders: { userLoader } }) => {
            return await userLoader.load(postedById);
        },

        votes: async ({ _id }, data, { dataloaders: { voteLoader } }) => {
            return [].concat(await voteLoader.load(_id));
        },
    },

    User: {
        id: root => root._id || root.id,

        votes: async ({ _id }, data, { dataloaders: { voteLoader } }) => {
            return [].concat(await voteLoader.load(_id));
        },
    },

    Vote: {
        id: root => root._id || root.id,

        user: async ({ userId }, data, { dataloaders: { userLoader } }) => {
            return await userLoader.load(userId);
        },

        link: async ({ linkId }, data, { dataloaders: { linkLoader } }) => {
            return await linkLoader.load(linkId);
        },
    },

    Subscription: {
        Link: {
            subscribe: () => pubsub.asyncIterator('Link'),
        },
    },
};