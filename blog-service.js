const fs = require("fs");
const {
    Module
} = require("module");

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

module.exports.getPostsByCategory = function (category) {
    return new Promise(function (resolve, reject) {
        var postsByCategory = [];

        for (let i = 0; i < posts.length; i++) {

            if (posts[i].category == category) {
                postsByCategory.push(posts[i]);
            }
        }

        if (postsByCategory.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(postsByCategory);
    });
}

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise(function (resolve, reject) {
        var postsByMinDate = [];

        for (let i = 0; i < posts.length; i++) {
            if (new Date(posts[i].postDate) >= new Date(minDateStr)) {
                postsByMinDate.push(posts[i]);
            }
        }

        if (postsByMinDate.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(postsByMinDate);
    });
    
}

module.exports.getPostsById = function (id) {
    return new Promise(function (resolve, reject) {
        var postById = [];
        
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].id == id) {
                postById.push(posts[i]);
            }
        }

        if (postById.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(postById);
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("query returned 0 results");
            return;
        }
        resolve(categories);
    })
}

module.exports.addPost = function (postData) {
    return new Promise(function (resolve, reject) {

        postData.published = (postData.published) ? true : false;
        postData.id = posts.length + 1;
        posts.push(postData);

        resolve();
    });

};