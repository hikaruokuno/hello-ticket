import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { collectionName } from './services/hello-ticket/constants';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', { structuredData: true });
//   response.send('Hello from Firebase!');
// });

admin.initializeApp();

export const members = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    const snap = await admin
      .firestore()
      .collection(collectionName.members)
      .get();
    const data = snap.docs.map((doc) => doc.data());
    res.send({ data });
  });
