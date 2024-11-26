const cookieParser = require('cookie-parser');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

const userModel = require('./models/users');
const postModel = require('./models/post');
const jwt = require('jsonwebtoken');
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.get('/', (req, res) => {
  res.render('index');
})
app.get('/login', (req, res) => {
  res.render('login');
})
app.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the cookie
  res.redirect('/login');
});
app.get('/profile', isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    // Log the user's posts to check if they exist
    // console.log("User's posts:", user.posts);

    if (user.posts.length > 0) {
      user = await userModel.findOne({ email: req.user.email }).populate('posts');
      // console.log("Populated posts:", user.posts);
    } else {
      console.log("No posts found for this user.");
    }

    res.render('profile', { user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Error fetching user data.");
  }
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  await post.save();
  res.redirect("/profile")
})

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  res.render('edit', { post });
})
app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content })
  res.redirect('/profile');
})

app.post('/post', isLoggedIn, async (req, res) => {

  user = await userModel.findOne({ email: req.user.email }).populate('posts');
  // console.log("Populated posts:", user.posts);

  let { content } = req.body;

  let post = await postModel.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save(); // Save the user with updated posts
  res.redirect('/profile');
})

app.post("/register", async (req, res) => {
  const { username, email, password, name, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        email,
        password: hash,
        name,
        age
      });

      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie('token', token)
      res.send("User registered successfully");
    })
  })
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return res.status(400).redirect("/login");
  }
  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).redirect("/login");
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        return res.status(500).send("An error occurred during authentication.");
      }

      if (result) {
        let token = jwt.sign({ email: email, userid: user._id }, "shhhh");

        // Set token as a cookie
        res.cookie("token", token, { httpOnly: true });

        // Redirect to profile
        return res.status(200).redirect("/profile");
      } else {
        return res.status(401).redirect("/login");
      }
    })
  } catch (error) {
    return res.status(500).send("Something went wrong.");
  }

})


function isLoggedIn(req, res, next) {
  if (req.cookies.token == "") res.redirect("/login");
  else {
    let data = jwt.verify(req.cookies.token, "shhhh")
    req.user = data;
    next();
  }
}

app.listen(port);