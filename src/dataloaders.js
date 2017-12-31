import DataLoader from 'dataloader';

const batchUsers = async (Users, keys) =>
    await Users.find({ _id: { $in: keys } }).toArray();

/*
const batchVotes = async (Votes, keys) =>
    await Votes.find({  }) // use or operator in Mongo. For userId and linkId
*/

module.exports.userLoader = ({ Users }) => ({
    userLoader: new DataLoader(
        keys => batchUsers(Users, keys),
        { cacheKeyFn: key => key.toString() },
    ),
})