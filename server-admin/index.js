require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 6060;

app.listen(PORT, () => {
    console.log(`Admin Server running on port ${PORT}`);
});
// Trigger nodemon restart
