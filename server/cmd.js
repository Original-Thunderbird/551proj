const fs = require('fs')
const path = require("path");
const config = require("./config")
const {NULL} = require("mysql/lib/protocol/constants/types");
// for funtions below, the uniform return format is [content (see each func for detailed explanation), error (need to convert to string format)]

function mkdir(ino, dir, callback) {
    var content = 'whatever', err = ''
    console.log('ino:', ino, ' dir:', dir)
    // content: anything you may want to tell the user
    config.sqlDB.query("SELECT * FROM meta WHERE PARENT = "+ino+" AND FILENAME ='"+dir+"'", function(err, result){
        console.log('result:',result)
        if(err) {
          console.log(err)
          throw err
        } else {
            //console.log(result[0].filename)
            if(result.length>0){
                callback("fail")
            }
            else{
                var now = new Date()
                var sql = "INSERT INTO META VALUES (?,?,?,?,?)"
                var fill = [Math.floor((Math.random()*10000) + 1), dir, now.toString(), ino,'d']
                config.sqlDB.query(sql, fill, function (err, result) {
                    callback("success")
                })
            }
        }

    });

}

function findIno(dir, callback) {
    var path = dir.split('/').slice(1)
    getTree(function (result){
        var ino = 0
        let res = ""
        var temp = result
        for(let i=0;i<path.length;i++){
            var found = false
            for(let j=0;j<temp.list.length;j++){
                //console.log("compare:"+temp.list[j].name+" "+path[i])
                if(temp.list[j].name===path[i]){
                    found = true
                    ino = temp.list[j].key
                    temp = temp.list[j]

                    res = res + "/" + path[i];
                    //console.log("found one:"+res)
                    break;
                }
            }
            if(!found){
                return callback("error",0)
            }
        }

        return callback(res,ino)
    })
}

function cd(dir,callback) {
    var content = '', err = ''
    //console.log('cd:', dir)
    var path = dir.split('/').slice(1)
    //console.log("path:"+path)
    // content: current working directory

    getTree(function (result){
        var ino = 0
        let res = ""
        var temp = result
        for(let i=0;i<path.length;i++){
            var found = false
            for(let j=0;j<temp.list.length;j++){
                //console.log("compare:"+temp.list[j].name+" "+path[i])
                if(temp.list[j].name===path[i]){
                    found = true
                    ino = temp.list[j].key
                    temp = temp.list[j]

                    res = res + "/" + path[i];
                    //console.log("found one:"+res)
                    break;
                }
            }
            if(!found){
                return callback("error",0)
            }
        }

        return callback(res,ino)
    })
    return [content, err];
}
class Entity{
    constructor(key,name,list,typ) {
        this.key = key
        this.name = name
        this.list = []
        this.typ = typ
    }
}
function getTree(callback){
    config.sqlDB.query("SELECT * FROM meta", function(err, result){

        if(err) {
            throw err
        } else {
            //console.log(result[0].filename)
            var l = result;

            var e = new Entity(0,"home",undefined, "d");
            dfs(e, e.key, l);
        }
        return callback(e)
    });
}

function dfs(e, cur, l){
    //console.log(e)
    for(let i=0;i<l.length;i++){
        //console.log(l[i].parent+" "+cur)
        if(l[i].parent==cur){
            e.list.push(new Entity(l[i].inumber, l[i].filename, undefined, l[i].typ))
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

    config.sqlDB.query("SELECT * FROM meta WHERE PARENT = "+file, function(err, result){
        var res = ""
        if(err) {

            erro = err

        } else {
            for(let i=0;i<result.length;i++){
                res = res + result[i].filename + " "
            }
        }
        return callback(res)
    });

}

// function cat(temp,callback) {
//     doQuery("{\"select\":[\"Industry\",\"Count\"],\"from\":\"Company\",\"where\":[],\"groupby\":\"Industry\"}",(attr)=>{callback(attr)})
// }

function cat(file,callback) {
    var content = '', err = ''
    console.log('cat:', file)
    // content: file content
    findIno(file, function (path, ino) {
        var arr = []
        config.sqlDB.query("SELECT * FROM parts WHERE inumber = "+ino, function (err, res) {
            for(let i=0;i<res.length;i++){
                arr.push(res[i].partno)
            }
            var result = ""
            for(let i=0;i<arr.length;i++){
                config.sqlDB.query("SELECT * FROM t"+arr[i], function (err, res) {
                    for(let j=0;j<res.length;j++){
                        result = result + res[j].ID +"\t"+res[j].Name+"\t"+res[j].SpecName+"\t"+res[j].Hired+"\t"+res[j].CompName+"\t"+res[j].Role+"\n"
                        if(i==arr.length-1&&j==res.length-1){
                            callback(result)
                        }
                    }
                })
            }
        })
    })
    return [content, err];
}

function deleteFile(ino) {
    config.sqlDB.query("SELECT * FROM PARTS WHERE INUMBER = "+ino, function (err, res) {
        if(err) console.log(err)
        var arr = []
        for(let i=0;i<res.length;i++){
            arr.push(res[i].partno)
        }
        for(let i=0;i<arr.length;i++){
            config.sqlDB.query("DROP TABLE t"+arr[i], function (err, res) {
                if(err) console.log(err)
                if(i==arr.length-1){
                    config.sqlDB.query("DELETE FROM PARTS WHERE INUMBER = "+ino, function (err, res) {
                        config.sqlDB.query("DELETE FROM META WHERE INUMBER = "+ino, function (err, res) {

                        })
                    })
                }
            })
        }
    })
}

function dfs1(nodelist, reslist, typlist, cur) {
    for(let i=0;i<nodelist.length;i++){
        if(nodelist[i].inumber==cur){
            reslist.push(cur)
            typlist.push(nodelist[i].typ)
        }
    }
    var temp = []
    for(let i=0;i<nodelist.length;i++){
        //console.log(l[i].parent+" "+cur)
        if(nodelist[i].parent==cur){
            temp.push(nodelist[i].inumber)
        }
    }
    for(let i=0;i<temp.length;i++){
        dfs1(nodelist, reslist, typlist, temp[i]);
    }
}

function rm(file, callback) {
    var content = 'whatever', err = ''
    console.log('rm:', file)
    findIno(file, function (path, ino) {
        config.sqlDB.query("SELECT * FROM META", function (err, res) {
            if(err) console.log(err)
            var reslist = []
            var typlist = []

            dfs1(res, reslist, typlist, ino)
            var str = "("+reslist.join(",")+")"
            console.log(str)
            for(let i=0;i<reslist.length;i++){
                if(typlist[i]=='f'){
                    deleteFile(reslist[i])
                }
            }
            config.sqlDB.query("DELETE FROM META WHERE INUMBER IN "+str, function (err, res) {
                if(err) console.log(err)
                else{
                    callback("1")
                }
            })
        })
    })

    return [content, err];
}

function put(file, dir, numParts, callback) {
    var content = 'whatever', err = ''
    console.log('put:', file, dir, numParts)
    var temp = file.split('/')
    var filename = temp[temp.length-1]
    var type = ''
    try {
        var data = fs.readFileSync(path.join(__dirname, file), "utf8");
        var json = JSON.parse(data)
        findIno(dir, function (path, ino) {
            var pnos = new Array(numParts)
            if('ID' in json[0]){
                type = 'fs'
                for(let i=0;i<numParts;i++){
                    pnos[i] = Math.floor(Math.random()*10000 + 1)
                    let sq = "CREATE TABLE t"+pnos[i]+"( ID varchar(50), Name varchar(50), SpecName varchar(80), Hired int, CompName varchar(40), Role varchar(40), pno varchar(10))"
                    config.sqlDB.query(sq, (err, res)=>{
                        if(err){
                            console.log(err);
                        }
                        if(i==numParts-1){
                            for(let j=0;j<json.length;j++){
                                var index = 0
                                var table = ""
                                console.log(json[j].ID)
                                var hash = parseInt(json[j].ID.substring(6,10))
                                index = hash%numParts
                                table = pnos[index]
                                console.log(pnos)
                                let sql = "INSERT INTO t"+table+" VALUES (?,?,?,?,?,?,?)"
                                let fill = [json[j].ID, json[j].Name, json[j].SpecName,json[j].Hired?1:0,json[j].CompName,json[j].Role, pnos[index]]
                                config.sqlDB.query(sql, fill, (err,res)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                })
                            }
                        }
                    })
                }
            }
            else{
                type = "fc"
                for(let i=0;i<numParts;i++){
                    pnos[i] = Math.floor(Math.random()*10000 + 1)
                    let sq = "CREATE TABLE t"+pnos[i]+"( Company varchar(50), Industry varchar(50), pno varchar(10))"
                    config.sqlDB.query(sq, (err, res)=>{
                        if(err){
                            console.log(err);
                        }
                        if(i==numParts-1){
                            for(let j=0;j<json.length;j++){
                                var index = 0
                                var table = ""
                                var hash = 0
                                for(let k=0;k<json[j].Company.length;k++){
                                    hash += json[j].Company.charCodeAt(k)
                                }
                                index = hash%numParts
                                table = pnos[index]
                                console.log(pnos)
                                let sql = "INSERT INTO t"+table+" VALUES (?,?,?)"
                                let fill = [json[j].Company, json[j].Industry, pnos[index]]
                                config.sqlDB.query(sql, fill, (err,res)=>{
                                    if(err){
                                        console.log(err)
                                    }
                                })
                            }
                        }
                    })
                }
            }


            var now = new Date()
            var sql = "INSERT INTO META VALUES (?,?,?,?,?)"
            var newFileNo = Math.floor((Math.random()*10000) + 1)
            var fill = [newFileNo, filename, now.toString(), ino, type]
            config.sqlDB.query(sql, fill, function (err, result) {
                for(let i=0;i<numParts;i++){
                    if(pnos[i]!=0){
                        let sqll = "INSERT INTO parts VALUES (?,?,?)"
                        let filll = [newFileNo, pnos[i], pnos[i]]
                        config.sqlDB.query(sqll, filll, (err,res)=>{
                            if(err){
                                console.log(err)
                            }
                        })
                    }
                }
                callback("success")
            })
        })
        //console.log("File content:", data);
        //use data


        return [content, '']
    } catch (err) {
        console.log(err)
        return ['', err.toString()]
    }
}


function getPartitionLocations(file, callback) {
    var content = '', err = ''
    console.log('getPartitionLocations:', file)
    findIno(file,function (path, ino) {

        if(path==="error"){
            return callback("error")
        }
        console.log(path + " " + ino)
        config.sqlDB.query("SELECT * FROM parts WHERE inumber = "+ino, function (err, res) {
            var ret = ""
            if(err) console.log(err)
            else console.log(res)
            for(let i=0;i<res.length;i++){
                ret = ret + res[i].partno + " "
            }
            callback(ret)
        })

    })
    // content: list of partitions, in string format
    return [content, err];
}

//note: numParts is in string format
function readPartition(file, numParts, callback) {
    var content = '', err = ''
    console.log('readPartition:', file, numParts)
    // content: file content at partition numParts
    findIno(file,function (path, ino) {

        if(path==="error"){
            return callback("error")
        }
        console.log(path + " " + ino)
        config.sqlDB.query("SELECT typ FROM meta WHERE inumber = "+ino,(err,res)=>{
            if(err){
                console.log(err)
            }
            if(res.length==0){
                return callback("No results found.")
            }
            console.log(res[0])
            if(res[0].typ=='fs'){
                config.sqlDB.query("SELECT * FROM parts WHERE inumber = "+ino+" AND tableno = "+numParts, function (err, res) {
                    if(err) console.log(err)
                    config.sqlDB.query("SELECT * FROM t"+numParts, function (err, res) {
                        var ret = ""
                        console.log(res.length)
                        for(let i=0;i<res.length;i++){
                            ret = ret + res[i].ID +"\t"+res[i].Name+"\t"+res[i].SpecName+"\t"+res[i].Hired+"\t"+res[i].CompName+"\t"+res[i].Role+"\n"
                        }
                        callback(ret)
                    })
                })
            }
            else if(res[0].typ=='fc'){
                config.sqlDB.query("SELECT * FROM parts WHERE inumber = "+ino+" AND tableno = "+numParts, function (err, res) {
                    if(err) console.log(err)
                    config.sqlDB.query("SELECT * FROM t"+numParts, function (err, res) {
                        var ret = ""
                        console.log(res.length)
                        for(let i=0;i<res.length;i++){
                            ret = ret + res[i].Company +"\t"+res[i].Industry+"\n"
                        }
                        callback(ret)
                    })
                })
            }
        })

    })
}

function doQuery(query, callback) {
    var json = JSON.parse(query)
    var select = json.select;
    var from = json.from
    var where = json.where
    var groupby = json.groupby
    if(from.toUpperCase() == "STUDENT"){
        config.sqlDB.query("select GROUP_CONCAT(p.partno SEPARATOR ',') as pno from meta m join parts p on m.inumber = p.inumber where m.typ = 'fs'", (err, res)=>{
            var strs = res[0].pno.split(',')
            var result = []
            for(let j=0 ;j<strs.length; j++){
                let partResult = []
                config.sqlDB.query("select * from t"+strs[j], function (err, res) {
                    if(err){
                        console.log(err)
                    }
                    for(let i=0;i<res.length;i++){
                        var flag = true
                        for(let con of where){
                            if(flag&&!studentCompare(res[i], con)){
                                flag = false
                            }
                        }
                        if(flag){
                            if(groupby!=undefined){
                                partResult.push(groupByRender(res[i], groupby))
                            }
                            else{
                                partResult.push(render(res[i], select))
                            }

                        }
                    }
                    result.push(partResult)
                    if(j==strs.length-1){

                        if(groupby!=undefined){
                            let map = new Map()
                            for(let p of result){
                                for(let e of p){
                                    if(map.has(e)){
                                        map.set(e,map.get(e)+1)
                                    }
                                    else{
                                        map.set(e, 1)
                                    }
                                }
                            }
                            var ret = ""
                            for(let [key,value] of map){
                                ret = ret + key + "\t" + value + "\n"
                            }
                            console.log(ret)
                            return callback(ret)
                        }
                        else{
                            return callback(result.toString())
                        }

                    }
                })
            }

        })
    }
    else if(from.toUpperCase() == "COMPANY"){
        config.sqlDB.query("select GROUP_CONCAT(p.partno SEPARATOR ',') as pno from meta m join parts p on m.inumber = p.inumber where m.typ = 'fc'", (err, res)=>{
            var strs = res[0].pno.split(',')
            var result = []
            for(let j=0 ;j<strs.length; j++){
                let partResult = []
                config.sqlDB.query("select * from t"+strs[j], function (err, res) {
                    if(err){
                        console.log(err)
                    }
                    for(let i=0;i<res.length;i++){
                        var flag = true
                        for(let con of where){
                            if(flag&&!companyCompare(res[i], con)){
                                flag = false
                            }
                        }
                        if(flag){
                            if(groupby!=undefined){
                                partResult.push(groupByRenderC(res[i], groupby))
                            }
                            else{
                                partResult.push(renderC(res[i], select))
                            }

                        }
                    }
                    result.push(partResult)
                    if(j==strs.length-1){

                        if(groupby!=undefined){
                            let map = new Map()
                            for(let p of result){
                                for(let e of p){
                                    if(map.has(e)){
                                        map.set(e,map.get(e)+1)
                                    }
                                    else{
                                        map.set(e, 1)
                                    }
                                }
                            }
                            var ret = ""
                            for(let [key,value] of map){
                                ret = ret + key + "\t" + value + "\n"
                            }
                            console.log(ret)
                            return callback(ret)
                        }
                        else{
                            return callback(result.toString())
                        }

                    }
                })
            }

        })
    }
}

function groupByRender(obj, groupby) {
    var res = ""
    switch (groupby) {
        case "ID":
            res = obj.ID
            break;
        case "Name":
            res = obj.Name
            break;
        case "SpecName":
            res = obj.SpecName
            break;
        case "Hired":
            res =  obj.Hired
            break;
        case "CompName":
            res = obj.CompName
            break;
        case "Role":
            res = obj.Role
            break;
    }
    return res
}

function groupByRenderC(obj, groupby) {
    var res = ""
    switch (groupby) {
        case "Company":
            res = obj.Company
            break;
        case "Industry":
            res = obj.Industry
            break;
    }
    return res
}

function render(obj, select){
    var res = ""
    for(let str of select){
        switch (str) {
            case "ID":
                res = res + obj.ID + "\r\t"
                break;
            case "Name":
                res = res + obj.Name + "\r\t"
                break;
            case "SpecName":
                res = res + obj.SpecName + "\r\t"
                break;
            case "Hired":
                res = res + obj.Hired + "\r\t"
                break;
            case "CompName":
                res = res + obj.CompName + "\r\t"
                break;
            case "Role":
                res = res + obj.Role + "\r\t"
                break;
        }
    }
    return res
}

function renderC(obj, select){
    var res = ""
    for(let str of select){
        switch (str) {
            case "Company":
                res = res + obj.Company + "\r\t"
                break;
            case "Industry":
                res = res + obj.Industry + "\r\t"
                break;
        }
    }
    return res
}

function studentCompare(obj, condition) {
    switch (condition.attr) {
        case "ID":
            return compare(obj.ID, condition.method, condition.value)
        case "Name":
            return compare(obj.Name, condition.method, condition.value)
        case "SpecName":
            return compare(obj.SpecName, condition.method, condition.value)
        case "Hired":
            return compare(obj.Hired, condition.method, condition.value)
        case "CompName":
            return compare(obj.CompName, condition.method, condition.value)
        case "Role":
            return compare(obj.Role, condition.method, condition.value)
        default:
            return undefined
    }
}

function companyCompare(obj, condition) {
    switch (condition.attr) {
        case "Company":
            return compare(obj.Company, condition.method, condition.value)
        case "Industry":
            return compare(obj.Industry, condition.method, condition.value)
        default:
            return undefined
    }
}

function compare(v1, condition, v2) {
    if(condition=='='){
        return v1 == v2
    }
    else if(condition=='<'){
        return v1 < v2
    }
    else if(condition=='>'){
        return v1 > v2
    }
    else if(condition=='>='){
        return v1 >= v2
    }
    else if(condition=='<='){
        return v1 <= v2
    }
}

exports.mkdir = mkdir
exports.cd = cd
exports.ls = ls
exports.cat = cat
exports.rm = rm
exports.put = put
exports.getPartitionLocations = getPartitionLocations
exports.readPartition = readPartition