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


    this.getFavourite = () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM films WHERE favorite = true';
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

    this.getWatchedToday = () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM films WHERE watchdate = ?';
            const today = dayjs().format('YYYY-MM-DD');
            db.all(query, [today], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    const films = rows.map(record => new Film(record.id, record.title, record.favorite == 1, record.watchdate, record.rating));
                    resolve(films);
                };
            });
        });
    };

    this.getWatchedBeforeDate = (watchdate) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM films WHERE watchdate < ?';
            db.all(query, [watchdate.format('YYYY-MM-DD')], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    const films = rows.map(record => new Film(record.id, record.title, record.favorite == 1, record.watchdate, record.rating));
                    resolve(films);
                };
            });
        });
    };

    this.getRatingOf = (score) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM films WHERE rating >= ?';
            db.all(query, [score], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    const films = rows.map(record => new Film(record.id, record.title, record.favorite == 1, record.watchdate, record.rating));
                    resolve(films);
                };
            });
        });
    };


    this.getWord = (string) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM films WHERE title LIKE ?';
            db.all(query, ["%" + string + "%"], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    const films = rows.map(record => new Film(record.id, record.title, record.favorite == 1, record.watchdate, record.rating));
                    resolve(films);
                };
            });
        });
    }


    this.storeMovie = (film) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO films (title, favorite, watchdate, rating) VALUES (?, ?, ?, ?)';
            const params = [film.title, film.favorite ? 1 : 0, film.watchDate ? film.watchDate.format('YYYY-MM-DD') : null, film.rating];
            db.run(query, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    };


    this.deleteMovie = (id) => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM films WHERE id = ?';
            db.run(query, id, function (err) {
                if (err)
                    reject(err);

                else
                    resolve({ change: this.changes });
            });
        });
    };

    this.deleteAllWatchDates = () => {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE films SET watchdate = NULL';
            db.run(query, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
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

        /*
                console.log('***List of favorites films:  ***');
                const favoriteFilm = await filmLibrary.getFavourite();
                if (favoriteFilm.length === 0) {
                    console.log('No favorites movies yet, try again later.');
                    filmLibrary.closeDB();
                    return;
                }
                else
                    favoriteFilm.forEach((film) => console.log(`${film}`));
                
                        console.log('***Movies watched today: ***');
                        const wathcedFilm = await filmLibrary.getWatchedToday();
                        if (wathcedFilm.length === 0) {
                            console.log('No movies watched today, try again later.');
                            filmLibrary.closeDB();
                            return;
                        }
                        else
                            wathcedFilm.forEach((film) => console.log(`${film}`));
               
                const watchdate = dayjs('2023-03-19');
                console.log('***Movies watched before ' + watchdate.format('YYYY-MM-DD') + ': ***');
                const watchedBeforeDate = await filmLibrary.getWatchedBeforeDate(watchdate);
                if (watchedBeforeDate.length === 0) {
                    console.log('No movies watched before the date, try again later.');
                    filmLibrary.closeDB();
                    return;
                }
                else
                    watchedBeforeDate.forEach((film) => console.log(`${film}`));
        
        
                const score = 4;
                console.log('*** Film with score greater or equal than ' + score + ': ***');
                const ratedFilm = await filmLibrary.getRatingOf(score);
                if (ratedFilm.length === 0) {
                    console.log('No film with a rating greater or equal than ' + score + '. Try later!');
                    filmLibrary.closeDB();
                    return;
                }
                else
                    ratedFilm.forEach((film) => console.log(`${film}`));
        */
        const string = 'war';
        console.log('*** Film with title containing ' + string + ': ***');
        const stringFilm = await filmLibrary.getWord(string);
        if (stringFilm.length === 0) {
            console.log('No film with a title containing ' + string + '. Try later!');
            filmLibrary.closeDB();
            return;
        }
        else
            stringFilm.forEach((film) => console.log(`${film}`));

        /*
                const nuovoFilm = new Film(10, 'Nuovo film', false, null, 4);
                try {
                    const result = await filmLibrary.storeMovie(nuovoFilm);
                    console.log('Nuovo film inserito con ID:', result.id);
                } catch (error) {
                    console.error('Impossibile inserire il nuovo film:', error);
                }
        */

        const filmIdToRemove = 8; // ID del film che si desidera rimuovere

        try {
            const result = await filmLibrary.deleteMovie(filmIdToRemove);
            if (result.changes >= 0) {
                console.log('Film rimosso con successo!');
            } else {
                console.log('Nessun film trovato con l\'ID specificato.');
            }
        } catch (error) {
            console.error('Impossibile rimuovere il film:', error);
        }

        try {
            const result = await filmLibrary.deleteAllWatchDates();
            if (result.changes > 0) {
                console.log('Date di visione di tutti i film eliminate con successo!');
            } else {
                console.log('Nessun film trovato con una data di visione da eliminare.');
            }
        } catch (error) {
            console.error('Impossibile eliminare le date di visione dei film:', error);
        }



    } catch (error) {
        console.error(`Impossible to retrieve movies! ${error}`);
        return;
    }
    // Additional instruction to enable debug 
    debugger;
};

main();