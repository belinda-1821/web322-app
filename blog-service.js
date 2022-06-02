const fs = require("fs");

let posts = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            posts = JSON.parse(data);

            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                categories = JSON.parse(data);
                resolve();
            });
        });
    });
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) {
            reject("query returned 0 results");
            return;
        }
        resolve(posts);
    })
}

module.exports.getPublishedPosts = function () {
    return new Promise(function (resolve, reject) {

        var publishedPosts = [];

        for (let i = 0; i < posts.length; i++) {

            if (posts[i].published === true) {
                publishedPosts.push(posts[i]);
            }
        }

        if (publishedPosts.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(publishedPosts);
    });
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("query returned 0 results");
            return;
        }
        resolve(categories);
    })
}