/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const { MongoClient, ObjectID } = require('mongodb');
const fetch = require('node-fetch');

const MONGODB_URI = process.env.DEEPHIRE_MONGODB_URI;

let cachedDb = null;

const message1 = {
  subject: 'Please Finish your DeepHire Introduction',
  text:
    'We saw that you started your video introduction but did not complete it, please click the button below to finish, or let us know if you ran into issues.',
};
const message2 = {
  subject: 'Pending - Your DeepHire Introduction',
  text:
    'Did you have issues with the video interivew? If so, let us know by replying to this email, if not - please click below to finish your introduction now. ',
};
const message3 = {
  subject: 'Still Interested in Completing your DeepHire Introduction?',
  text:
    'Are you still interested in completing your DeepHire Introduction? If so, please click the button below to finish.',
};
const message4 = {
  subject: 'Last Chance - Finish your DeepHire Introduction',
  text:
    'The opportunity to complete your video introduction is ending soon - please click the button below to finish it now.',
};

const messages = [message1, message2, message3, message4];
async function connectToDatabase() {
  const uri = MONGODB_URI;
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  const connection = await MongoClient.connect(uri);
  console.log('=> creating a new connection');
  cachedDb = connection.db('content');
  return Promise.resolve(cachedDb);
}

const sendReminderEmail = async body => {
  const url = 'https://a.deephire.com/v1/emails';
  const template = 'finish-your-video-interview';

  const { candidateEmail, completeInterviewData, userName } = body;

  // eslint-disable-next-line no-underscore-dangle
  const interviewId = completeInterviewData.interviewData._id;
  const interviewUrl = `https://interviews.deephire.com?id=${interviewId}&fullname=${userName}&email=${candidateEmail}`;
  let userNameFirst;
  if (userName) {
    // eslint-disable-next-line prefer-destructuring
    userNameFirst = userName.split(' ')[0];
  }

  const { subject, text } = messages[body.count];
  const data = {
    recipients: [candidateEmail],
    template,
    interviewUrl,
    text,
    userNameFirst,
    subject,
  };
  const headers = { 'Content-Type': 'application/json' };
  console.log(data);
  const emailSent = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
  console.log(emailSent);
  return emailSent;
};

async function getStatus(db, body) {
  console.log(body);
  const { candidateEmail, completeInterviewData } = body;
  console.log(body, candidateEmail, completeInterviewData);
  // eslint-disable-next-line no-underscore-dangle
  const interviewId = completeInterviewData.interviewData._id;
  console.log('=> query database');

  const candidate = await db
    .collection('videos')
    .findOne({
      candidateEmail,
      interviewId: new ObjectID(interviewId),
    })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      return { statusCode: 500, body: 'error adding to mongodb' };
    });

  if (candidate && candidate.responses) {
    body.completed = true;
    return body;
  }
  await sendReminderEmail(body);
  body.completed = false;
  return body;
}

const executeMongo = async (event, context, callback) => {
  console.log('event:', event);
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;
  let body = {};
  if (event.body !== null && event.body !== undefined) {
    body = JSON.parse(event.body);
  } else if (event.Input) {
    body = event.Input;
  }

  // const { candidateEmail, completeInterviewData } = body;

  const db = await connectToDatabase();
  const resp = await getStatus(db, body);
  console.log(resp);
  callback(null, resp);
};

module.exports.handler = executeMongo;

// executeMongo({body: {city: 'Hammondsville', state: "Ohio"}}, {}, {})
