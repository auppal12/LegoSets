/********************************************************************************
* BTI325 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Amitoj Singh Uppal       Student ID: 105186225       Date: 28th Sept, 2023
*
********************************************************************************/

const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            setData.forEach(set => {
                let theme = themeData.find(theme => theme.id === set.theme_id);
                if (theme) {
                    set.theme = theme.name;
                    sets.push(set);
                }
            });
            resolve();
        } catch (error) {
            reject("Error occurred - initialize()");
        }
    });
}

function getAllSets() {
    return new Promise((resolve, reject) => {
        try {
            resolve(sets);
        } catch (error) {
            reject("Error occurred - getAllSets()");
        }
    });
}

function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        try {
            let set = sets.find(set => set.set_num === setNum);
            if (set) {
                resolve(set);
            } else {
                reject(`Unable to find requested set: ${setNum}`);
            }
        } catch (error) {
            reject("Error occurred - getSetByNum(setNum)");
        }
    });
}

function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        try {
            let lowerCase = theme.toLowerCase();
            let themedSets = sets.filter(set => set.theme.toLowerCase().includes(lowerCase));
            if (themedSets.length > 0) {
                resolve(themedSets);
            } else {
                reject(`Unable to find requested sets with theme: ${theme}`);
            }
        } catch (error) {
            reject("Error occurred - getSetsByTheme(theme)");
        }
    });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };

// Call the initialize function
//initialize();

// Test getAllSets function
//console.log(getAllSets());

// Test getSetByNum function
//console.log(getSetByNum("001-1"));

// Test getSetsByTheme function
//console.log(getSetsByTheme("tech"));