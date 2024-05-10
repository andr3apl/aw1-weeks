'use strict';

/*
function Film(id, title, like, date, rating) {
    this.id = id;
    this.title = title;
    this.like = like;
    this.date = date;
    this.rating = rating;
}

function FilmLibrary() {

    this.films = [];


    this.addNewFilm = function (film) {
        this.films.push(film);
    };

    this.print = function () {
        console.log("Film List: ");
        for (let film of this.films) {
            console.log(`Id: ${film.id}, Title: ${film.title}, Favorite: ${film.like}, Watch date: ${film.date || '<not defined>'}, Score: ${film.rating || '<not assigned>'}`);
        }
    };

    this.sortByDay = function () {
        console.log("***Film Sorted***");
        this.films.sort((a, b) => {
            if (a.date && b.date) {
                return new Date(a.date) - new Date(b.date);
            } else if (!a.date && b.date) {
                return 1; // Put films with undefined dates after those with defined dates
            } else if (a.date && !b.date) {
                return -1; // Put films with defined dates before those with undefined dates
            } else {
                return 0; // Both dates are undefined, keep them in their positions
            }
        });
    }

    this.deleteFilm = function (id) {
        const index = this.films.findIndex(film => film.id === id);
        if (this.index !== -1) {
            this.films.splice(index, 1)
            console.log(`Film with ID ${id} deleted successfully.`);
        } else {
            console.log(`Film with ID ${id} not found.`);
        }
    }

    this.resetWatchedFilm = function () {
        for (let f of this.films) {
            f.date = null;
        }
    }

    this.getRated = function () {
        const ratedFilms = this.films.filter(film => film.rating !== undefined).sort((a, b) => b.rating - a.rating);
        console.log("Rated Films (Rating between 1 and 5):");
        for (let film of ratedFilms) {
            console.log(`Id: ${film.id}, Title: ${film.title}, Favorite: ${film.like}, Watch date: ${film.date || '<not defined>'}, Score: ${film.rating}`);
        }
    };

};

const filmlibrary = new FilmLibrary();

const pulpFiction = new Film(1, 'Pulp Fiction', true, 'March 10, 2023', 5);
const twentyOneGrams = new Film(2, '21 Grams', true, 'March 17, 2023', 4);
const starWars = new Film(3, 'Star Wars', false);
const matrix = new Film(4, 'Matrix', false);
const shrek = new Film(5, 'Shrek', false, 'March 21, 2023', 3);

filmlibrary.addNewFilm(pulpFiction);
filmlibrary.addNewFilm(twentyOneGrams);
filmlibrary.addNewFilm(starWars);
filmlibrary.addNewFilm(matrix);
filmlibrary.addNewFilm(shrek);

filmlibrary.print();
filmlibrary.sortByDay();
filmlibrary.print();
filmlibrary.deleteFilm(2);
filmlibrary.print();
filmlibrary.resetWatchedFilm();
filmlibrary.print();
filmlibrary.getRated();
filmlibrary.print();
*/

const dayjs = require("dayjs");
const sqlite3 = require('sqlite3');


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
    this.list = [];

    this.print = () => {
        console.log("***** List of films *****");
        this.list.forEach((item) => console.log(item.toString()));
    }

    this.addNewFilm = (film) => {
        if (!this.list.some(f => f.id == film.id))
            this.list.push(film);
        else
            throw new Error('Duplicate id');
    };

    this.deleteFilm = (id) => {
        const newList = this.list.filter(function (film, index, arr) {
            return film.id !== id;
        })
        this.list = newList;
    }

    this.resetWatchedFilms = () => {
        this.list.forEach((film) => delete film.watchDate);
    }

    this.getRated = () => {
        const newList = this.list.filter(function (film, index, arr) {
            return film.rating > 0;
        })
        return newList;
    }

    this.sortByDate = () => {
        const newArray = [...this.list];
        newArray.sort((d1, d2) => {
            if (!(d1.watchDate)) return 1;   // null/empty watchDate is the lower value
            if (!(d2.watchDate)) return -1;
            return d1.watchDate.diff(d2.watchDate, 'day')
        });
        return newArray;
    }

}


function main() {
    // Creating some film entries
    const f1 = new Film(1, "Pulp Fiction", true, "2023-03-10", 5);
    const f2 = new Film(2, "21 Grams", true, "2023-03-17", 4);
    const f3 = new Film(3, "Star Wars", false);
    const f4 = new Film(4, "Matrix", false);
    const f5 = new Film(5, "Shrek", false, "2023-03-21", 3);

    // Adding the films to the FilmLibrary
    const library = new FilmLibrary();
    library.addNewFilm(f1);
    library.addNewFilm(f2);
    library.addNewFilm(f3);
    library.addNewFilm(f4);
    library.addNewFilm(f5);

    // Print Sorted films
    console.log("***** List of films (sorted) *****");
    const sortedFilms = library.sortByDate();
    sortedFilms.forEach((film) => console.log(film.toString()));

    // Deleting film #3
    library.deleteFilm(3);

    // Reset dates
    library.resetWatchedFilms();

    // Printing modified Library
    library.print();

    // Retrieve and print films with an assigned rating
    console.log("***** Films filtered, only the rated ones *****");
    const ratedFilms = library.getRated();
    ratedFilms.forEach((film) => console.log(film.toString()));

    // Additional instruction to enable debug 
    debugger;
}

main();