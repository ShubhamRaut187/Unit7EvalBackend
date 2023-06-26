const mongoose = require("mongoose");

const connection = mongoose.connect(process.env.MONGODB);

module.exports = {
    connection
}

