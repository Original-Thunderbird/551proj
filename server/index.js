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

app.post('/sqltest', (req, res) => {
    console.log("body: ", req.body)
    const name = req.body.name
    const age = req.body.age
    const country = req.body.country

    switch(handle){
        case 1:
            config.sqlDB.query(
                'INSERT INTO test (name, age, country) VALUES (?, ?, ?)', 
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

app.post('/put', (req, res) => {
    // console.log(req.body.file);
    // console.log(req.body);
    // console.log(req.body.numPart);
    var err = "Put not success", content  = "Success"
    route.Route("put", [0,req.body.numPart], req.body.file, function (result){res.send({content: result, err: err});})

});


app.post('/cmd',  (req, res) => {
    var cmd = req.body.cmd, params = req.body.params, filename = req.body.filename;
    //console.log(cmd, params, filename)
    var content = "1", err = "";
    route.Route(cmd, params, filename, function (result){res.send({content: result, err: err});});
    //res.send({content: "", err: err});
});

app.post('/put', (req, res) => {
    console.log(req.body.file);
    console.log(req.body.file['bookid']);
    console.log(req.body.numPart);
    res.send('success');
});

app.post('/db', (req, res) => {
    config.srcDB = req.body.db;
    console.log(config.srcDB);
    res.send(req.body.db);
});

app.post('/query', (req, res) => {
    console.log(req.body.rawQuery);
    var output = '', err = ''
    analysis.HandleQuery(req.body.rawQuery,(params)=>{
        res.send({output: params[0], err: params[1]});
    })

});


app.listen(3001, () => {
    console.log("hello node")
})