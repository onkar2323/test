require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth.js");
const Post = require("./model/post.js");


const app = express();

app.use(express.json());

// Logic goes here

module.exports = app;


// importing user context
const User = require("./model/user");

//-----------------------------------------------USER ROUTES-----------------------------------------------

//Register
app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: 30,
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

//Login
app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // save user token
            user.token = token;

            // user
            res.status(200).json(user);
        } else res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

//Welcome
app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

//-----------------------------------------------POST ROUTES-----------------------------------------------

app.post("/user/post", auth, async (req, res) => {
    try {
    const { date, task, status, userEmail } = req.body;


    const post = await Post.create({date,task,status,userEmail,});


    res.status(201).json(post);
    } catch (err) {
        console.log(err);
        res.json(err.message);
        
    }

})

app.patch("/user/post/:id", auth, async (req, res) => {
    const id = req.params.id;
    const post =  Post.findByIdAndUpdate(id, req.body, (err)=>{
        if(err) res.status(400).json(err.message);
        else res.status(200).send("Post Updated");
    });
})


app.delete("/user/post/:id", auth, async (req, res) => {
    const id = req.params.id;
    const post =  Post.findByIdAndRemove(id, (err)=>{
        if(err) res.status(400).json(err.message);
        else res.status(200).send("Post Deleted");
    });
})


app.get("/user/posts", auth, async (req, res) => {
    const perpage = req.params.perpage;
    const page = req.params.page;

    const {email} = req.body;
    const posts = await Post.find({userEmail:email}).limit(perpage).skip((perpage * page) - perpage);
    res.status(200).json(posts);
    
})

app.get("/user/sortedposts", auth, async (req, res) => {

    const perpage = req.params.perpage;
    const page = req.params.page;

    const {email} = req.body;
    const posts = await Post.find({userEmail:email}).sort({date:-1}).limit(perpage).skip((perpage * page) - perpage);
    res.status(200).json(posts);
    
})