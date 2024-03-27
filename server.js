const express = require('express');
const legoData = require('./modules/legoSets');
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');

const app = express();

const HTTP_PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(
    clientSessions({
        cookieName: 'session', // this is the object name that will be added to 'req'
        secret: process.env.SESSION_SECRET, // this should be a long un-guessable string.
        duration: 3 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
        activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
    })
);

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: "", userName: "" });
});

app.get('/register', (req, res) => {
    res.render('register', { successMessage: "", errorMessage: "", userName: "" });
});

app.post('/register', (req, res) => {
    authData.registerUser(req.body)
        .then(() => res.render('register', { successMessage: 'User created' }))
        .catch((err) => res.render('register', { successMessage: "", errorMessage: err, userName: req.body.userName }));
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory,
        };
        res.redirect('/lego/sets');
    })
        .catch((err) => res.render('login', { errorMessage: err, userName: req.body.userName }));
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
});

app.get('/lego/addSet', ensureLogin, (req, res) => {
    legoData.getAllThemes()
        .then(themeData => {
            res.render('addSet', { themes: themeData });
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.post('/lego/addSet', ensureLogin, (req, res) => {
    legoData.addSet(req.body)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.get('/lego/editSet/:num', ensureLogin, async (req, res) => {
    let setNum = req.params.num;
    try {
        let setData = await legoData.getSetByNum(setNum);
        let themeData = await legoData.getAllThemes();
        res.render('editSet', { themes: themeData, set: setData });
    } catch (err) {
        res.status(404).render("404", { message: err.message });
    }
});

app.post('/lego/editSet', ensureLogin, async (req, res) => {
    let setNum = req.body.set_num;
    let setData = req.body;
    try {
        await legoData.editSet(setNum, setData);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.get('/lego/deleteSet/:num', ensureLogin, async (req, res) => {
    let setNum = req.params.num;
    try {
        await legoData.deleteSet(setNum);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
    }
});

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/lego/sets', (req, res) => {
    if (req.query.theme) {
        legoData.getSetsByTheme(req.query.theme)
            .then((sets) => {
                res.render("sets", { sets: sets });
            })
            .catch(error => {
                res.status(404).render("404", { message: "No Sets found for a matching theme" });
            });
    } else {
        legoData.getAllSets().then((sets) => {
            res.render("sets", { sets: sets });
        })
            .catch(error => {
                res.status(404).render("404", { message: "No Sets found for a matching theme" });
            });
    }
});

app.get('/lego/sets/:set_num', (req, res) => {
    legoData.getSetByNum(req.params.set_num)
        .then((set) => {
            res.render("set", { set: set });
        })
        .catch(error => {
            res.status(404).render("404", { message: "No Sets found for a specific set num" });
        });
});

app.use((req, res) => {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});

async function startServer() {
    try {
        // Initialize your services
        await legoData.initialize();
        await authData.initialize();
        // Start listening for requests
        app.listen(HTTP_PORT, () => {
            console.log(`Server is running on port ${HTTP_PORT}`);
        });
    } catch (error) {
        console.error(`Failed to start the server: ${error}`);
    }
}

// Start the server
startServer();