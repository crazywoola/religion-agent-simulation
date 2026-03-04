import 'dotenv/config';
import { HOST, PORT, getLanUrls, resolveListenHostUrl } from './src/config/runtime.js';
import { createApp } from './src/server/create-app.js';

const { app } = createApp();

app.listen(PORT, HOST, () => {
  console.log(`Server running at ${resolveListenHostUrl(HOST)}`);
  if (HOST === '0.0.0.0' || HOST === '::') {
    const lanUrls = getLanUrls(PORT);
    if (lanUrls.length) {
      console.log(`Local network access:\n- ${lanUrls.join('\n- ')}`);
    }
  }
});
