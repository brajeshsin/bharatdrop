const mongoose = require('mongoose');

const uri = "mongodb+srv://supportbrijesh_db_user:tghzPhFF5zPjKlJg@bharatdrop.zcco8ap.mongodb.net/?retryWrites=true&w=majority";

async function run() {
    try {
        await mongoose.connect(uri);
        console.log("Successfully connected to MongoDB via Mongoose");
        console.log("Database name:", mongoose.connection.name);
    } catch (err) {
        console.error("Connection failed:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}
run();
