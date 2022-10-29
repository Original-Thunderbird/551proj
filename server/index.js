const express = require('express')
const cors = require("cors")
const multer = require('multer')
const fileUpload = require('express-fileupload');
const path = require("path");
const route = require('./route')
const analysis = require('./analysis')
const config = require('./config')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("files"));
app.use(fileUpload());

handle = 1

app.post('/create', (req, res) => {
    console.log("body: ", req.body)
    const name = req.body.name
    const age = req.body.age
    const country = req.body.country

    switch(handle){
        case 1:
            config.sqlDB.query(
                'INSERT INTO employees (name, age, country) VALUES (?, ?, ?)', 
                [name, age, country], (err, result) => {
                    if(err) {
                        console.log(err)
                    } else {
                        res.send("Vals inserted")
                    }
                }
            );
            break;
        // case 2:
        //     emp.add(req.body)
        //     res.send("Vals inserted")
    }
});

app.post('/cmd',  (req, res) => {
    var cmd = req.body.cmd, params = req.body.params, filename = req.body.filename;
    //console.log(cmd, params, filename)
    var content = "1", err = "";
    route.Route(cmd, params, filename, function (result){res.send({content: result[0].name, err: err});});
    //res.send({content: "", err: err});
});

app.post('/db', (req, res) => {
    config.srcDB = req.body.db;
    res.send(req.body.db);
});

app.post('/query', (req) => {
    var [output, err] = analysis.HandleQuery(req.body.rawQuery)
    res.send({output: output, err: err});
});


app.listen(3001, () => {
    console.log("hello node")
})