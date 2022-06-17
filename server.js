/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: ___Belinda Jean Preeth Jerien____ Student ID: ___122442212__ Date: __June 17, 2022__
*
* Heroku App URL: https://belinda-web322-assignment3.herokuapp.com/
*
* GitHub Repository URL: https://github.com/belinda-1821/web322-app

********************************************************************************/

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');


const blog = require('./blog-service');
const app = express();

cloudinary.config({
    cloud_name: 'bjpjerien',
    api_key: '999693617868597',
    api_secret: 'vTRdDIh-HJl6W-DPkSuaSG10XMI',
    secure: true
});

const upload = multer();


var path = require('path');
var views = path.join(__dirname, 'views');


blog.initialize().then(function () {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Server Started at port 8080");
    })
}).catch(function (err) {
    console.log("unable to start server: " + err);
});


app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(views, 'about.html'));
});

app.get('/posts', (req, res) => {
    if (req.query.category) {
        blog.getPostsByCategory(req.query.category).then((data)=>{
            res.json(data)
        }).catch((err)=>{
            res.json({
                message: "No Results"
            });
        })
    } else if(req.query.minDate){
        blog.getPostsByMinDate(req.query.minDate).then((data)=>{
            res.json(data)
        }).catch((err)=>{
            res.json({
                message: "No Results"
            });
        })
    } else {
        blog.getAllPosts().then((data) => {
                res.json(data)
            })
            .catch((err) => {
                res.json({
                    message: "no results"
                });
            })
    }
})

app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(views, 'addPost.html'));
});

app.get('/posts/:id', (req, res)=>{
    blog.getPostsById(req.params.id).then((data) => {
        res.json(data)
    })
    .catch((err) => {
        res.json({
            message: "no results"
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
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        console.log(req.body);
        blog.addPost(req.body).then(() => {
            res.redirect('/posts');
        })
    }
})

app.get('/blog', (req, res) => {
    blog.getPublishedPosts().then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.json({
                message: "no results"
            });
        })
})

app.get('/categories', (req, res) => {
    blog.getCategories().then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.json({
                message: "no results"
            });
        })
})
app.use((req, res) => {
    res.status(404).sendFile(path.join(views, '404.html'));
});