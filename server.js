/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ___Belinda Jean Preeth Jerien____ Student ID: ___122442212__ Date: __July 22, 2022__
*
* Heroku App URL: https://belinda-web322-assignment5.herokuapp.com/
*
* GitHub Repository URL: https://github.com/belinda-1821/web322-app

********************************************************************************/

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const stripJs = require('strip-js');

const blog = require('./blog-service');
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Handlebar setup and custom helpers
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context); 
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));
app.set('view engine', '.hbs');

// Cloudinary for image upload
cloudinary.config({
    cloud_name: 'bjpjerien',
    api_key: '999693617868597',
    api_secret: 'vTRdDIh-HJl6W-DPkSuaSG10XMI',
    secure: true
});

const upload = multer();

// View Path settings
var path = require('path');
var views = path.join(__dirname, 'views');

// Starting Server
blog.initialize().then(function () {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Server Started at port 8080");
    })
}).catch(function (err) {
    console.log("unable to start server: " + err);
});


app.use(express.static('public'));

// Set Active Route Style
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/blog');
});

app.get('/about', (req, res) => {
    res.render('about')
});

// Post Routes
app.get('/posts/add', (req, res) => {
    blog.getCategories().then((data) => {
        res.render('addPost', {
            categories: data
        });
    }).catch((err) => {
        res.render('addPost', {
            categories: []
        });
    })
});

app.get('/posts', (req, res) => {
    if (req.query.category) {
        blog.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0) {
                res.render('posts', {
                    posts: data
                })
            } else {
                res.render('posts', { message: "No Results" });
            }
        }).catch((err) => {
            res.render("posts", { message: "No results" });
        })
    } else if (req.query.minDate) {
        blog.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0) {
                res.render('posts', {
                    posts: data
                })
            } else {
                res.render('posts', { message: "No Results" });
            }
        }).catch((err) => {
            res.render("posts", { message: "No results" });
        })
    } else {
        blog.getAllPosts().then((data) => {
            if (data.length > 0) {
                res.render('posts', {
                    posts: data
                })
            } else {
                res.render('posts', { message: "No Results" });
            }
        })
            .catch((err) => {
                res.render("posts", { message: "No results" });
            })
    }
})

app.get('/posts/:id', (req, res) => {
    blog.getPostsById(req.params.id).then((data) => {
        res.json(data)
    })
        .catch((err) => {
            res.json({
                message: "No results"
            });
        })
})


app.post('/posts/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        blog.addPost(req.body).then(() => {
            res.redirect('/posts');
        })
    }
})

app.get('/post/delete/:id', (req, res) => {
    blog.deletePostById(req.params.id).then(() => {
        res.redirect('/posts');
    }).catch((err) => {
        res.status(500).render('posts', { message: "Unable to delete Post/ Post not Found" });
    })
});

// Blog Routes

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        posts = await blog.getPostById(req.params.id);
        let post = posts[0];
        viewData.post = post;
    } catch (err) {
        viewData.message = "no results";
    }


    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
    console.log(viewData);

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })

});

// Category Routes

app.get('/categories', (req, res) => {
    blog.getCategories().then((data) => {
        if (data.length > 0) {
            res.render('categories', {
                categories: data
            })
        } else {
            res.render('categories', { message: "No results" });
        }

    })
        .catch((err) => {
            res.render('categories', {
                message: "No results"
            });
        })
})

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
    console.log(req);
    blog.addCategory(req.body).then(() => {
        res.redirect('/categories');
    }).catch((err) => {
        res.render('categories', { message: 'Unable to add Category' });
    })
});

app.get('/categories/delete/:id', (req, res) => {
    blog.deleteCategoryById(req.params.id).then(() => {
        res.redirect('/categories');
    }).catch((err) => {
        res.render('categories', { message: "Unable to delete Category" });
    })
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404')
});