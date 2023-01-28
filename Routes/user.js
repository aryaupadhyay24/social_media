const User = require("../model/User");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const fetchuser=require('../middleware/fetchuser')
// const User = require('../model/User');

var jwt = require('jsonwebtoken');

// secret key should be included in .env file
const JWT_SECRET = 'thisissecretkey';


// create a user


router.post('/',

 
  async (req, res) => {
    try {
      let success = false
      var salt = await bcrypt.genSaltSync(10);
      var secPas = bcrypt.hashSync(req.body.password, salt);

      let p = await User.findOne({ email: req.body.email });
      console.log(`value od p  is ${p}  value of email ${req.body.email}`);
      if (p) {
        let msg = `User with ${req.body.email} already exist`;
        res.send({ success, msg });
      }
      else {
        user = await User.create({
          username: req.body.username,
          email: req.body.email,
          password: secPas,

        });
        success = true;



        // now creatig auth token
        //  here data is second part of jwt that is payload
        const data = {
          user: {
            id: user.id
          }
        }
        const authToken = await jwt.sign(data, JWT_SECRET)  //it require a data which is encoded on header portion for that we give it objectid bcz objectid is accessible in fstest way
        res.json({ authToken, success });


        console.log(req.body);
        // res.send({secPas});
      }
    }
    catch (err) {
      console.log(err.message);
      res.send(err.message);

    }
  });

// jwt.verify return decoded payload






// Now we have to check for login info for existing user


router.post('/login',
  async (req, res) => {
    try {
      
      let success = false;
      const email = req.body.email;

      const exist = await User.findOne({ email });
      if (!exist) {

        return res.status(401).send({ success });
      }
      const r = await bcrypt.compare(req.body.password, exist.password);
      if (!r) {
        return res.status(401).send({ success });
      }
      const data = {
        user: {
          id: exist.id
        }
      }
      success = true
      const authToken = await jwt.sign(data, JWT_SECRET)
      res.status(200).json({ authToken, success });
    }
    catch (err) {
      res.send("Server error");
      console.log(err);
    }
  });





//get a user
router.get("/:username",fetchuser, async (req, res) => {
  
  try {
    const username=req.params.username
    const user = await User.find({username:username});
    console.log(user)
    console.log(req.params.username)
    if(user){
      
      const { password, updatedAt, ...other } = user;
      res.status(200).json(other);
    }
    else{
      res.send("user not found")
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});




// followers of user
router.get("/:username/followers",fetchuser, async (req, res) => {
  
  try {
    const username=req.params.username
    const user = await User.find({username:username});
    console.log(user)
    console.log(req.params.username)
    if(user){
      
      const { followers } = user;
      res.status(200).json(followers);
    }
    else{
      res.send("user not found")
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

// following of user
router.get("/:username/following",fetchuser, async (req, res) => {
  
  try {
    const username=req.params.username
    const user = await User.find({username:username});
    console.log(user)
    console.log(req.params.username)
    if(user){
      
      const { following } = user;
      res.status(200).json(following);
    }
    else{
      res.send("user not found")
    }
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});




//follow a user

router.put("/:username/follow",fetchuser, async (req, res) => {
  if (req.body.username !== req.params.username) {
    try {
      const username=req.params.username
      const user = await User.find({username});
      const activeusername=req.body.username
      const currentUser = await User.find({activeusername});
      if (!user.followers.includes(req.body.username)) {
        await user.updateOne({ $push: { followers: req.body.username } });
        await currentUser.updateOne({ $push: { followings: req.params.username } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:username/unfollow",fetchuser, async (req, res) => {
  if (req.body.username !== req.params.username) {
    try {
      const username=req.params.username
      const user = await User.find({username});
      const activeusername=req.body.username
      const currentUser = await User.find({activeusername});
      if (user.followers.includes(req.body.username)) {
        await user.updateOne({ $pull: { followers: req.body.username } });
        await currentUser.updateOne({ $pull: { followings: req.params.username } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});



//update user
router.put("/:id", fetchuser,async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id",fetchuser, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

module.exports = router;