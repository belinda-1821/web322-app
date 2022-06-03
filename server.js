const express = require('express');
const blog = require('./blog-service');
const app = express();



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

app.get('/posts', (req, res)=>{
    blog.getAllPosts().then((data)=>{
        res.json(data)
    })
    .catch((err)=>{
        res.json({
            message: "no results"
        });
    })
})

app.get('/blog', (req, res)=>{
    blog.getPublishedPosts().then((data)=>{
        res.json(data)
    })
    .catch((err)=>{
        res.json({
            message: "no results"
        });
    })
})

app.get('/categories', (req, res)=>{
    blog.getCategories().then((data)=>{
        res.json(data)
    })
    .catch((err)=>{
        res.json({
            message: "no results"
        });
    })
})
app.use((req, res) => {
    res.status(404).sendFile(path.join(views, '404.html'));
});

