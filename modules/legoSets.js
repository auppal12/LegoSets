require('dotenv').config();
const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

const Theme = sequelize.define(
    'Theme',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true, // use "id" as a primary key
            autoIncrement: true, // automatically increment the value
        },
        name: Sequelize.STRING,
    },
    {
        createdAt: false, // disable createdAt
        updatedAt: false, // disable updatedAt
    }
);

const Set = sequelize.define(
    'Set',
    {
        set_num: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: Sequelize.STRING,
        year: Sequelize.INTEGER,
        num_parts: Sequelize.INTEGER,
        theme_id: Sequelize.INTEGER,
        img_url: Sequelize.STRING,
    },
    {
        createdAt: false, // disable createdAt
        updatedAt: false, // disable updatedAt
    }
);

Set.belongsTo(Theme, { foreignKey: 'theme_id' });


function initialize() {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.sync();
            resolve();
        } catch (err) {
            reject("Error occurred - initialize()");
        }
    });
}

function getAllSets() {
    return new Promise((resolve, reject) => {
        Set.findAll({ include: [Theme] })
            .then((sets) => {
                resolve(sets);
            })
            .catch((err) => {
                reject(`Error occurred - getAllSets(): ${err.message}`);
            });
    });
}


function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        Set.findAll({ include: [Theme], where: { set_num: setNum } })
            .then((sets) => {
                if (sets.length > 0) {
                    resolve(sets[0]); // Resolving with the first element of the array
                } else {
                    reject(`Unable to find requested set: ${setNum}`);
                }
            })
            .catch((err) => {
                reject(`Error occurred - getSetByNum(setNum) : ${err.message}`);
            });
    });
}

function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        Set.findAll({
            include: [Theme],
            where: {
                '$Theme.name$': {
                    [Sequelize.Op.iLike]: `%${theme}%`
                }
            }
        })
            .then((themedSets) => {
                if (themedSets.length > 0) {
                    resolve(themedSets);
                } else {
                    reject(`Unable to find requested sets with theme: ${theme}`);
                }
            })
            .catch((err) => {
                reject(`Error occurred - getSetsByTheme(theme): ${err.message}`);
            });
    });
}

function getAllThemes() {
    return new Promise((resolve, reject) => {
        Theme.findAll()
            .then(themes => {
                resolve(themes);
            })
            .catch(error => {
                reject(`Error occurred - getAllThemes(): ${error.message}`);
            });
    });
}

function addSet(setData) {
    return new Promise((resolve, reject) => {
        Set.create({
            set_num: setData.set_num,
            name: setData.name,
            year: setData.year,
            num_parts: setData.num_parts,
            theme_id: setData.theme_id,
            img_url: setData.img_url,
        })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(`Error occurred - cannot add the set: ${err.errors[0].message}`);
            });
    });
}

function editSet(set_num, setData) {
    return new Promise(async (resolve, reject) => {
        try {
            let exist = await Set.findOne({ where: { set_num: set_num } });
            if (exist) {
                await exist.update(setData);
                resolve();
            } else {
                reject("Not able to find the Set");
            }
        } catch (err) {
            reject(err.errors[0].message);
        }
    });
}

function deleteSet(set_num) {
    return new Promise(async (resolve, reject) => {
        try {
            let exist = await Set.findOne({ where: { set_num: set_num } });
            if (exist) {
                await exist.destroy();
                resolve();
            }
            else {
                reject("Not able to find the Set")
            }
        }
        catch (err) {
            reject(err.errors[0].message)
        }
    });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet };