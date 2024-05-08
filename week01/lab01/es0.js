'use strict';

const strings = ['ciaone', 'comodino', 'a','stavano', 'tastiera', 'boa', 'il', 'ciliegia'];

const fn = (arr) => {
    for (const e of arr) {
        if (e.length < 2) {
            console.log("");
        }
        else if(e.length==2){
            const newWord=e.repeat(2);
            console.log(newWord);
        }
        else if (e.length <= 3) {
            const newWord=e.substring(0,2)+ e.substring(1,3);
            console.log(newWord);
        }
        else {
            const newWord = e.substring(0, 2) + e.substring(e.length - 2);
            console.log(newWord);
        }
    }
}

fn(strings);

