import DataLoader from 'dataloader';

const batchUsers = async (Users, keys) => {
    return await Users.find({ _id: { $in: keys } }).toArray();;
}

const batchVotes = async (Votes, keys) => {
    return await Votes.find({$or: [{ userId: { $in: keys } }, { linkId: { $in: keys } }]}).toArray();
}

const batchLinks = async (Links, keys) => {
    return await Links.find({ _id: { $in: keys } }).toArray();
}

module.exports = (mongo) => {
    const { Votes, Users, Links } = mongo;

    return {
        userLoader: new DataLoader(
            keys => batchUsers(Users, keys),
            { cacheKeyFn: key => key.toString() },
        ),
    
        voteLoader: new DataLoader(
            keys => batchVotes(Votes, keys),
            { cacheKeyFn: key => key.toString() },
        ),

        linkLoader: new DataLoader(
            keys => batchLinks(Links, keys),
            { cacheKeyFn: key => key.toString() },
        )
    }
}