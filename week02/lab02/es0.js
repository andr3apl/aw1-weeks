'use strict';

const dayjs = require("dayjs");
const sqlite = require('sqlite3');

function Film(id, title, isFavorite = false, watchDate, rating) {
    this.id = id;
    this.title = title;
    this.favorite = isFavorite;
    this.rating = rating;
    // saved as dayjs object only if watchDate is truthy
    this.watchDate = watchDate && dayjs(watchDate);

    this.toString = () => {
        return `Id: ${this.id}, ` + `Title: ${this.title}, Favorite: ${this.favorite}, ` + `Watch date: ${this.formatWatchDate('MMMM D, YYYY')}, ` + `Score: ${this.formatRating()}`;
    }

    this.formatWatchDate = (format) => {
        return this.watchDate ? this.watchDate.format(format) : '<not defined>';
    }

    this.formatRating = () => {
        return this.rating ? this.rating : '<not assigned>';
    }
}


function FilmLibrary() {

    const db = new sqlite.Database('films.db', (err) => { if (err) throw err; });

    this.closeDB = () => {
        try {
            db.close();
        }
        catch (error) {
            console.log('Impossible to close the database. Error:');
            console.error(error);
        }
    }

    this.getAll = () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM films';
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    const films = rows.map(record => new Film(record.id, record.title, record.favorite == 1, record.watchdate, record.rating));
                    resolve(films);
                }
            });
        });
    };
}


async function main() {

    const filmLibrary = new FilmLibrary();

    try {
        // get all the movies
        console.log('\n****** All the movies in the database: ******');
        const films = await filmLibrary.getAll();
        if (films.length === 0) {
            // If there are not movies in the database it is useless to execute other queries.
            console.log('No movies yet, try later.');
            filmLibrary.closeDB();
            return;
        }
        else
            films.forEach((film) => console.log(`${film}`));

    } catch (error) {
        console.error(`Impossible to retrieve movies! ${error}`);
        return;
    }
    // Additional instruction to enable debug 
    debugger;
};

main();