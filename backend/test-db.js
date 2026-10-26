require('dotenv').config();
const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => { console.log('CONNECTED'); process.exit(0); })
  .catch((e) => {
    console.log('Error:', e.name);
    if (e.reason && e.reason.servers) {
      for (const s of e.reason.servers.values()) {
        console.log(s.address, '->', s.error ? s.error.message : 'no error');
      }
    } else {
      console.log(e.message);
    }
    process.exit(1);
  });
