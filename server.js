/********************************************************************************
* BTI325 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Amitoj Singh Uppal       Student ID: 105186225       Date: 13th Oct, 2023
*
* Published URL: https://prickly-hat-tick.cyclic.app/
********************************************************************************/

const express = require('express');
const legoData = require('./modules/legoSets');
const path = require('path');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));});

    app.get('/lego/sets', (req, res) => {
        if(req.query.theme) {
            legoData.getSetsByTheme(req.query.theme)
            .then((sets) => {
                res.json(sets);
            })
            .catch(error => {
                res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
            });
        } else {
            legoData.getAllSets().then((sets) => {
                res.json(sets);
            })
            .catch(error => {
                res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
            });
        }
    });
    
    app.get('/lego/sets/:set_num', (req, res) => {
        legoData.getSetByNum(req.params.set_num)
        .then((set) => {
            res.json(set);
        })
        .catch(error => {
            res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
        });
    });
    
    app.use((req, res) => {
        res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
    });
    
legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server is running on port ${HTTP_PORT}`);
    });
});