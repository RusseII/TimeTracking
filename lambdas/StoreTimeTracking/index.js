/* eslint-disable no-console */
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.RUSSELL_WORK_MONGODB_URI;

let cachedDb = null;
const timestamp = () => new Date().toString();

async function connectToDatabase() {
  const uri = MONGODB_URI;
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  const connection = await MongoClient.connect(uri);
  console.log('=> creating a new connection');
  cachedDb = connection.db('russell_work');
  return Promise.resolve(cachedDb);
}

async function getStatus(db, body) {
  console.log('=> store data');

  return db
    .collection('time_tracking')
    .insert({ ...body, timestamp: timestamp() })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      return { statusCode: 500, body: 'error adding to mongodb' };
    });
}

const storeData = async (event, context, callback) => {
  console.log('event:', event);
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;
  let body = {};
  if (event.body !== null && event.body !== undefined) {
    body = JSON.parse(event.body);
  }

  const db = await connectToDatabase();
  const resp = await getStatus(db, body);
  console.log(resp);
  callback(null, resp);
};

module.exports.handler = storeData;
