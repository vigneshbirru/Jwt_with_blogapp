const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://vignesh23birru:Vighneshp123@cluster0.vqiq5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("Connected to MongoDB"))
.catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);  // Exit process if unable to connect
  });

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    posts: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },  // Reference to the "Post" model
      ],
})

module.exports = mongoose.model('user', userSchema);