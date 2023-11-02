/********************************************************************************
* BTI325 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Amitoj Singh Uppal       Student ID: 105186225       Date: 1st November, 2023
*
* Published URL: https://prickly-hat-tick.cyclic.app/
********************************************************************************/

const express = require('express');
const legoData = require('./modules/legoSets');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(express.static('public'));
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

legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server is running on port ${HTTP_PORT}`);
    });
});