'use strict';

function Film(id, title, like, date, rating) {
    this.id = id;
    this.title = title;
    this.like = like;
    this.date = date;
    this.rating = rating;
}

function FilmLibrary(){
    this.films=[];
}