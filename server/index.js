const express = require('express')
const cors = require("cors")
const multer = require('multer')
const fileUpload = require('express-fileupload');
const path = require("path");
const route = require('./route')

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

app.post("/upload", (req, res) => {
    const file = req.files.file;
  
    file.mv(path.join(__dirname, '/file/', file.name), (err) => {
      if (err) {
        console.log(err)
        res.status(500).send({ message: "File upload failed", code: 200 });
      } else{
        console.log('here')
        res.send("File Uploaded");
      }
    });
});

app.get('/employees', (req, res) => {
    config.sqlDB.query("SELECT * FROM employees", (err, result) => {
        if(err) {
            console.log(err)
        } else {
            res.send(result)
        }
    });
});

app.post('/cmd',  (req, res) => {
    var cmd = req.body.cmd, params = req.body.params, filename = req.body.filename;
    //console.log(cmd, params, filename)
    var [content, err] = route.Route(cmd, params, filename);
    res.send({content: content, err: err});

    // switch(handle){
    //     case 1:
    //         config.sqlDB.query(
    //             'INSERT INTO employees (name, age, country) VALUES (?, ?, ?)', 
    //             [name, age, country], (err, result) => {
    //                 if(err) {
    //                     console.log(err)
    //                 } else {
    //                     res.send("Vals inserted")
    //                 }
    //             }
    //         );
    //         break;
    //     // case 2:
    //     //     emp.add(req.body)
    //     //     res.send("Vals inserted")
    // }
});

app.listen(3001, () => {
    console.log("hello node")
})