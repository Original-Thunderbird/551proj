const fs = require('fs')
const path = require("path");
const config = require("./config")
const db = require("firebase/database");
const { update } = require('firebase/database');
const axios = require('axios');

const url = config.firebaseConfig.databaseURL
nameNode = url + "nameNode/"
dataNode = url + "dataNode/"
location = nameNode + "/file_location/.json"
partition = nameNode + "/file_partition/.json"
file_location = {}
file_partition = {}

function setUp(callback) {
    axios.patch(nameNode + ".json", data = '{"default": "null"}')
    axios.patch(dataNode + ".json", data = '{"default": "null"}')

    axios.get(location)
        .then(response => {
            data = response.data
            if (data != null && Object.keys(data).length != 0) {
                file_location = data
                axios.get(partition).then(response => {
                    file_partition = response.data
                    callback(file_location, file_partition)
                })
            } else {
                callback(file_location, file_partition)
            }

        })
        .catch(error => {
            console.log(error);
        });
}

function mkdir(dir, callback) {
    setUp((file_location, file_partition) => {
        // assume dir start with /
        res = dir.slice(1).split('/')
        n = res.length
        parentDir = dir.slice(1, dir.lastIndexOf('/') + 1)
        axios.get(nameNode + parentDir + "/.json")
            .then(response => {
                data = response.data
                if (data === null) {
                    callback("parent directory not found")
                } else {
                    new_dir = nameNode + dir.slice(1) + "/.json"
                    axios.get(new_dir).then(response => {
                        if (response.data !== null) {
                            callback("new directory already exists")
                        } else {
                            axios.put(new_dir, '{"default": "null"}')
                            callback("success")
                        }
                    })
                }
            })
    });
}

function ls(file, callback) {
    setUp((file_location, file_partition) => {
        // Assume file starts with "/"
        directory = nameNode + file + "/.json"
        ans = ""
        axios.get(directory)
            .then(response => {
                data = response.data
                if (data === null) {
                    callback("directory not found")
                } else {
                    for (key in data) {
                        if (key !== "default") {
                            ans = ans + key + " "
                        }
                    }
                    callback(ans)
                }
            })
    })
}

function cat(path, callback) {

    setUp((file_location, file_partition) => {



        // Assums path starts with /
        console.log('cat:', path)

        path = path.split(".")[0]
        temp = path.split("/")
        file = temp[temp.length - 1]
        fileName = file.split(".")[0]

        if (!(fileName in file_location)) {
            callback("file not found")
            return
        }
        file_loc = file_location[fileName]
        k_partition = file_partition[fileName]
        var res = []
        let promises = []
        for (let i = 0; i < k_partition; i++) {
            promises.push(
                axios.get(dataNode + file_loc + "/" + fileName + (i + 1) + ".json").then((response) => {
                    res.push.apply(res, response.data)
                }))

        }

        Promise.all(promises).then(() => {
            callback(res)
        })
    })
}

function rm(path, callback) {
    setUp((file_location, file_partition) => {

        // Assume path starts with /, ends with .json
        res = path.slice(1).split('/')

        fileName = res[res.length - 1].split(".")[0]
        if (!(fileName in file_location)) {
            callback("file not exist")
        }
        file_loc = file_location[fileName]

        parentDir = path.slice(1, path.lastIndexOf('/') + 1)
        axios.get(nameNode + parentDir + "/.json")
            .then(response => {
                data = response.data
                if (data === null) {
                    callback("parent directory not found")
                }
            })

        rm_nameNode_dir = nameNode + path
        rm_dataNode_dir = dataNode + file_loc + ".json"

        axios.put(rm_nameNode_dir, '{}')
        axios.put(rm_dataNode_dir, '{}')
        delete file_location[fileName]
        delete file_partition[fileName]
        patch_file();
        callback("Successfully removed.")
    })

}

function put(file, dir, numParts, callback) {
    setUp((file_location, file_partition) => {
        // Assume file is in *.json, dir starts with /
        var fileName = file.split(".")[0]
        if (fileName in file_location) {
            callback("file already exist, please remove first")
        }

        var parentDir = dir.slice(1, dir.lastIndexOf('/') + 1)
        axios.get(nameNode + parentDir + "/.json")
            .then(response => {
                data = response.data
                if (data === null) {
                    callback("parent directory not found")
                }
            })

        var data = fs.readFileSync(path.join(__dirname, file), "utf8");
        var json = JSON.parse(data)
        var pnos = new Array(numParts)

        for (let i = 0; i < numParts; i++) {
            pnos[i] = json.slice(Math.floor(json.length * i / numParts), Math.floor(json.length * (i + 1) / numParts));
        }

        //put into name node
        var res = dir.slice(1).split('/')
        var put_dir = nameNode + dir + "/.json"
        var put_key = res.join("_") + "_" + fileName
        var put_val = {}
        put_val[fileName] = put_key
        axios.patch(put_dir, put_val)

        //put into data node
        for (let i = 1; i < numParts + 1; i++) {
            put_dir = dataNode + put_key + "/" + fileName + i + "/.json"
            axios.put(put_dir, pnos[i - 1])
        }

        file_location[fileName] = put_key
        file_partition[fileName] = numParts
        patch_file();
    })
}


function getPartitionLocations(file, callback) {
    setUp((file_location, file_partition) => {
        fileName = file.split(".")[0]
        if (fileName in file_location) {
            callback(file_location[fileName])
        } else {
            callback("file not found")
        }
    })
}

//note: numParts is in string format
function readPartition(file, numParts, callback) {
    setUp((file_location, file_partition) => {

        console.log('readPartition:', file, numParts)

        fileName = file.split(".")[0]
        partitionNum = parseInt(numParts)
        var file_loc
        if (fileName in file_location) {
            file_loc = file_location[fileName]
            if (partitionNum > parseInt(file_partition[fileName]) || partitionNum === 0) {
                callback("Partition not found.")
            } else {
                file_path = dataNode + file_loc + "/" + fileName + partitionNum + "/.json"
                axios.get(file_path).then((response) => {
                    callback(response.data)
                })
            }
        } else {
            callback("file not found")
        }
    })
}

function doQuery(query, callback) {
    var json = JSON.parse(query)
    var select = json.select;
    var from = json.from
    var where = json.where
    var groupby = json.groupby
    if (from.toUpperCase() == "STUDENT") {
        config.sqlDB.query("select GROUP_CONCAT(p.partno SEPARATOR ',') as pno from meta m join parts p on m.inumber = p.inumber where m.typ = 'fs'", (err, res) => {
            var strs = res[0].pno.split(',')
            var result = []
            for (let j = 0; j < strs.length; j++) {
                let partResult = []
                config.sqlDB.query("select * from t" + strs[j], function (err, res) {
                    if (err) {
                        console.log(err)
                    }
                    for (let i = 0; i < res.length; i++) {
                        var flag = true
                        for (let con of where) {
                            if (flag && !studentCompare(res[i], con)) {
                                flag = false
                            }
                        }
                        if (flag) {
                            if (groupby != undefined) {
                                partResult.push(groupByRender(res[i], groupby))
                            }
                            else {
                                partResult.push(render(res[i], select))
                            }

                        }
                    }
                    result.push(partResult)
                    if (j == strs.length - 1) {

                        if (groupby != undefined) {
                            let map = new Map()
                            for (let p of result) {
                                for (let e of p) {
                                    if (map.has(e)) {
                                        map.set(e, map.get(e) + 1)
                                    }
                                    else {
                                        map.set(e, 1)
                                    }
                                }
                            }
                            var ret = ""
                            for (let [key, value] of map) {
                                ret = ret + key + "\t" + value + "\n"
                            }
                            console.log(ret)
                            return callback(ret)
                        }
                        else {
                            return callback(result.toString())
                        }

                    }
                })
            }

        })
    }
    else if (from.toUpperCase() == "COMPANY") {
        config.sqlDB.query("select GROUP_CONCAT(p.partno SEPARATOR ',') as pno from meta m join parts p on m.inumber = p.inumber where m.typ = 'fc'", (err, res) => {
            var strs = res[0].pno.split(',')
            var result = []
            for (let j = 0; j < strs.length; j++) {
                let partResult = []
                config.sqlDB.query("select * from t" + strs[j], function (err, res) {
                    if (err) {
                        console.log(err)
                    }
                    for (let i = 0; i < res.length; i++) {
                        var flag = true
                        for (let con of where) {
                            if (flag && !companyCompare(res[i], con)) {
                                flag = false
                            }
                        }
                        if (flag) {
                            if (groupby != undefined) {
                                partResult.push(groupByRenderC(res[i], groupby))
                            }
                            else {
                                partResult.push(renderC(res[i], select))
                            }

                        }
                    }
                    result.push(partResult)
                    if (j == strs.length - 1) {

                        if (groupby != undefined) {
                            let map = new Map()
                            for (let p of result) {
                                for (let e of p) {
                                    if (map.has(e)) {
                                        map.set(e, map.get(e) + 1)
                                    }
                                    else {
                                        map.set(e, 1)
                                    }
                                }
                            }
                            var ret = ""
                            for (let [key, value] of map) {
                                ret = ret + key + "\t" + value + "\n"
                            }
                            console.log(ret)
                            return callback(ret)
                        }
                        else {
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
            res = obj.Hired
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

function render(obj, select) {
    var res = ""
    for (let str of select) {
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

function renderC(obj, select) {
    var res = ""
    for (let str of select) {
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
    if (condition == '=') {
        return v1 == v2
    }
    else if (condition == '<') {
        return v1 < v2
    }
    else if (condition == '>') {
        return v1 > v2
    }
    else if (condition == '>=') {
        return v1 >= v2
    }
    else if (condition == '<=') {
        return v1 <= v2
    }
}

function patch_file() {
    axios.put(location, file_location)
    axios.put(partition, file_partition)
}


exports.mkdir = mkdir
exports.ls = ls
exports.cat = cat
exports.rm = rm
exports.put = put
exports.getPartitionLocations = getPartitionLocations
exports.readPartition = readPartition