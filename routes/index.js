const express = require('express');
const router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const multer = require('multer');
// const LocalStrategy = passportLocal.Strategy;

const usersInfo = require('./users');
const mailInfo = require('./mails');

passport.use(new localStrategy(usersInfo.authenticate()));

const storage = multer.diskStorage({
  destination : (req, res, cb)=>{
    cb(null, '/public/images/uploads')
  },
  filename : (req, file, cb)=>{
    const fn = Date.now()+Math.round(Math.random() * 1E9) + file.originalname
    console.log(fn)
    cb(null, fn);
  }
})

const upload = multer({storage : storage})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function isLoggedOut(req, res, next){
  if(req.isAuthenticated()){
    res.redirect('/inbox');
  }
  return next();
}

router.get('/', isLoggedOut, (req, res)=>[
  res.render('home')
]);

router.post('/signup', isLoggedOut, (req, res)=>{
  const newUser = new usersInfo({
    firstN : req.body.firstN,
    lastN : req.body.lastN,
    username : req.body.username,
    gender : req.body.gender,
    email : req.body.email,
    pNumber : req.body.pNumber
  })
  usersInfo.register(newUser, req.body.password)
    .then((abc)=>{
      passport.authenticate('local')(req, res, ()=>{
        res.redirect('/inbox')
      })
    })
    .catch((err)=>{
      res.send(err);
    })
})

router.post('/signin', isLoggedOut, passport.authenticate('local', {
  successRedirect : '/inbox',
  failureRedirect : '/'
}), (req, res)=>{});

router.get('/logout', isLoggedIn, (req, res)=>{ 
  req.logOut((err)=>{
    if (err) throw err;
    res.redirect('/');
  })
})

router.get('/delete/:id', isLoggedIn,(req, res)=>{
  // const loggedInUser = await usersInfo.findOne({username : req.session.passport.user});
  usersInfo.findOneAndDelete({_id : req.params.id})
  .then((data)=>{
    res.redirect('/logout');
  })
})

router.get('/inbox', isLoggedIn, async (req, res)=>{
  const loggedInUser = await usersInfo.findOne({username : req.session.passport.user})
  .populate({
    path : 'recievedMails',
    populate : {
      path : 'userid'
    }
  })
  console.log(loggedInUser.profilePic);
  res.render('inbox', {user : loggedInUser});
  // res.send(loggedInUser.profilePic);
})

router.post('/composeMail', isLoggedIn, async (req, res)=>{
  const loggedInUser = await usersInfo.findOne({username : req.session.passport.user});
  const createdMail = await mailInfo.create({
    email : req.body.email,
    subject : req.body.subject,
    mailText : req.body.mailText,
    userid : loggedInUser._id
  })


  loggedInUser.sentMails.push(createdMail._id);
  const loggedInUserUpdated = await loggedInUser.save();

  const recieverUser = await usersInfo.findOne({email : req.body.email});

  recieverUser.recievedMails.push(createdMail._id);
  const recieverUserUpdated = await recieverUser.save();

  res.redirect(req.headers.referer);
})

router.get('/profile', isLoggedIn, async (req, res)=>{
  const loggedInUser = await usersInfo.findOne({username : req.session.passport.user});
  res.render('profile', {user : loggedInUser});
})

router.post('/setProfilePic',upload.single('profilepic'), async (req, res, next)=>{
  const loggedInUser = await usersInfo.findOne({username : req.session.passport.user});
  loggedInUser.profilePic = req.file.filename;
  await loggedInUser.save();
  res.redirect('/inbox');
})

router.get('/check/:username', (req,res)=>{
  usersInfo.findOne({username : req.params.username})
  .then((user)=>{
    res.json(user);
  })
})

router.get('/checkemail/:email', (req, res)=>{
  usersInfo.findOne({email : req.params.email})
  .then((user)=>{
    res.json(user);
  })
})

router.get('/edit/:id',isLoggedIn,(req, res)=>{
  usersInfo.findOne({_id : req.params.id})
  .then((edit)=>{
    res.render('edit', {edit})
  })
})

router.post('/update/:id',isLoggedIn, (req, res)=>{
  usersInfo.findOne({_id : req.params.id}, {
    firstN : req.body.firstN,
    lastN : req.body.lastN,
    email : req.body.email,
    username : req.body.username,
    pNumber : req.body.pNumber
  })
  .then(()=>{
    res.redirect('/profile')
  })
})


module.exports = router;
