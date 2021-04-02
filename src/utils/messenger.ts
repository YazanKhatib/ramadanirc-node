import admin from 'firebase-admin';

declare function require(name: string);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../../ramadan-app-2da87-firebase-adminsdk-vbr2g-df8283c373.json');

export const initializeMesseging = async () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

export const sendMessage = async (
  registrationToken: string,
  title: string,
  body: string,
) => {
  const payload: unknown = {
    notification: {
      title: title,
      body: body,
    },
  };
  await admin.messaging().sendToDevice(registrationToken, payload);
};
