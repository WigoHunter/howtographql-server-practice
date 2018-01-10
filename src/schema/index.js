import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';

// Define types
const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
        postedBy: User
        votes: [Vote]
    }

    type Query {
        allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
        allUsers: [User!]!
        allVotes: [Vote!]!
    }

    type Mutation {
        createLink(url: String!, description: String!): Link
        createVote(linkId: ID!): Vote
        createUser(name: String!, authProvider: AuthProviderSignupData!): User
        signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
    }

    type User {
        id: ID!
        name: String!
        email: String
        password: String
        votes: [Vote!]!
    }

    input AuthProviderSignupData {
        email: AUTH_PROVIDER_EMAIL
    }

    input AUTH_PROVIDER_EMAIL {
        email: String!
        password: String!
    }

    type SigninPayload {
        token: String
        user: User
    }

    type Vote {
        id: ID!
        user: User!
        link: Link!
    }

    type Subscription {
        Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
        Vote(filter: VoteSubscriptionFilter): VoteSubscriptionPayload
    }

    input LinkSubscriptionFilter {
        mutation_in: [_ModelMutationType!]
    }

    type LinkSubscriptionPayload {
        mutation: _ModelMutationType!
        node: Link
    }

    input VoteSubscriptionFilter {
        mutation_in: [_ModelMutationType!]
    }

    type VoteSubscriptionPayload {
        mutation: _ModelMutationType!
        node: Vote
    }

    enum _ModelMutationType {
        CREATED
        UPDATED
        DELETED
    }

    input LinkFilter {
        OR: [LinkFilter!]
        description_contains: String
        url_contains: String
    }
`;

export default makeExecutableSchema({ typeDefs, resolvers });