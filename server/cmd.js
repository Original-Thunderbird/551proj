const fs = require('fs')
const path = require("path");
const config = require("./config")
const {NULL} = require("mysql/lib/protocol/constants/types");
// for funtions below, the uniform return format is [content (see each func for detailed explanation), error (need to convert to string format)]

function mkdir(dir) {
    var content = 'whatever', err = ''
    console.log('mkdir:', dir)
    // content: anything you may want to tell the user
    return [content, err];
}

function cd(dir) {
    var content = '', err = ''
    console.log('cd:', dir)
    // content: current working directory
    return [content, err];
}
class Entity{
    constructor(key,list) {
        this.key = key
        this.list = []
    }
}
function getTree(){
    config.sqlDB.query("SELECT * FROM meta", function(err, result){

        if(err) {
            throw err
        } else {
            var l = result;
            var e = new Entity(0,undefined);
            dfs(e, e.key, l);
        }
        return callback(result)
    });
}

function dfs(e, cur, l){
    console.log(e.key)
    for(let i=0;i<l.length;i++){
        if(l[i].parent==cur){
            e.list.push(new Entity(l[i].inumber,undefined))
        }
    }
    for(let i=0;i<e.list.length;i++){
        dfs(e.list[i],e.list[i].key,l);
    }
}

function ls(file, callback) {

    var content = '', erro = '';
    console.log('ls:', file)
    // content: list of dirs & files in string format

    config.sqlDB.query("SELECT * FROM employees", function(err, result){

        if(err) {

            erro = err

        } else {
            content = result

        }
        return callback(result)
    });

}

function cat(file) {
    var content = '', err = ''
    console.log('cat:', file)
    // content: file content
    return [content, err];
}

function rm(file) {
    var content = 'whatever', err = ''
    console.log('rm:', file)
    // content: anything you may want to tell the user
    return [content, err];
}

//note: numParts is in string format
function put(file, dir, numParts) {
    var content = 'whatever', err = ''
    console.log('put:', file, dir, numParts)
    try {
        var data = fs.readFileSync(path.join(__dirname, file), "utf8");
        console.log("File content:", data);
        //use data


        return [content, '']
    } catch (err) {
        console.log(err)
        return ['', err.toString()]
    }
}

function getPartitionLocations(file) {
    var content = '', err = ''
    console.log('getPartitionLocations:', file)
    // content: list of partitions, in string format
    return [content, err];
}

//note: numParts is in string format
function readPartition(file, numParts) {
    var content = '', err = ''
    console.log('readPartition:', file, numParts)
    // content: file content at partition numParts
    return [content, err];
}

exports.mkdir = mkdir
exports.cd = cd
exports.ls = ls
exports.cat = cat
exports.rm = rm
exports.put = put
exports.getPartitionLocations = getPartitionLocations
exports.readPartition = readPartition