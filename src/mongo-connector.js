import { Logger, MongoClient } from 'mongodb';

const MONGO_URL = 'mongodb://127.0.0.1:27017/hackernews';

module.exports = async () => {
    const db = await MongoClient.connect(MONGO_URL);

    /*
    let logCount = 0;
    Logger.setCurrentLogger((msg, state) => {
        console.log(`MONGODB REQUEST ${++logCount}: ${msg}`);
    });
    Logger.setLevel('debug');
    Logger.filter('class', ['Cursor']);
    */

    return {
        Links: db.db('hackernews').collection('links'),
        Users: db.db('hackernews').collection('users'),
        Votes: db.db('hackernews').collection('votes'),
    };
  }