import AppleAuth from 'apple-auth';
import fs from 'fs';
import path from 'path';
//TODO: fill with real data
const config = {
  client_id: 'MyDeeds',
  team_id: '2BF4U4V7DX',
  redirect_uri: '', // Leave it blank
  key_id: '8NL3D5V7KJ',
  scope: 'name%20email',
};
const appleAuth = new AppleAuth(
  config,
  fs
    .readFileSync(
      path.join(__dirname, '..', '..', '/data/AuthKey_8NL3D5V7KJ.p8'),
    )
    .toString(),
  'text',
);

export default appleAuth;
