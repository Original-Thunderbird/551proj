const fs = require('fs')
const path = require("path");
const config = require("./config")
const db = require("firebase/database");
const { update } = require('firebase/database');
const axios = require('axios');

const url = config.firebaseConfig.databaseURL
curr_dir = "/"
nameNode = url + "nameNode"
dataNode = url + "dataNode/"
curr_dir_url = url + curr_dir + ".json"
location = nameNode + "/file_location/.json"
partition = nameNode + "/file_partition/.json"
file_location = {}
file_partition = {}

function setUp(callback) {
    axios.patch(nameNode + ".json", data = '{"default": "null"}')
    axios.patch(dataNode + ".json", data = '{"default": "null"}')

    axios.get(curr_dir_url).then(response => {
        if (response.data === null){
            curr_dir = "/"
        } else {
            curr_dir = response.data
        }

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
    })
        .catch(error => {
            console.log(error);
        });
}

function cd(dir, callback) {
    setUp((file_location, file_partition) => {
        if (dir == ".."){
            if (curr_dir == "/"){
                callback(curr_dir)
            } else {
                curr_dir = curr_dir.slice(0, curr_dir.lastIndexOf("/"))
                patch_file()
                curr_dir_url = url + curr_dir + ".json"
                callback(curr_dir)
            }
        }
        else {
            new_dir = curr_dir === '/' ? "/" + dir : curr_dir + "/" + dir
            console.log("target child dir is:", new_dir)
            console.log("name node to visit:", nameNode + new_dir + ".json")
            axios.get(nameNode + new_dir + ".json").then(response => {
                console.log(response.data)
                if (response.data === null){
                    console.log("triggered")
                    callback("directory not found")
                } else {
                    curr_dir = new_dir
                    curr_dir_url = url + curr_dir + ".json"
                    console.log("curr_dir after cd:", curr_dir)
                    //patch_file()
                    callback(curr_dir)
                }
            })

        } 
    });
}

function mkdir(dir, callback) {
    setUp((file_location, file_partition, curr_dir) => {
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
                    callback("in ls:directory not found")
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

function patch_file() {
    axios.put(location, file_location)
    axios.put(partition, file_partition)
    axios.put(curr_dir_url, curr_dir)
}

function doQuery(query, callback) {
    var json = JSON.parse(query)
    var select = json.select;
    var from = json.from
    var where = json.where
    var groupby = json.groupby

    // retrieve number of partitions
    // assume from file always exists
    filename = from + ".json"
    axios.get(nameNode + "/file_partition/" + from + "/.json").then((response) => {
        numPartitions = response.data
        promises = []
        partResult = []
        for (let i = 1; i < numPartitions + 1; i++) {
            promises.push(new Promise((resolve, reject) => {
                readPartition(filename, i, (data) => {
                    partResultGroupBy = {}
                    for (const d of data) {
                        // filter the where clause
                        var flag = true
                        if (where != undefined) {
                            for (let con of where) {
                                if (!compare(d, con)) {
                                    flag = false
                                }
                            }
                        }
                        if (flag) {
                            // handle group by
                            if (groupby != undefined) {
                                group = d[groupby]
                                if (group in partResultGroupBy) {
                                    partResultGroupBy[group] = partResultGroupBy[group] + 1
                                } else {
                                    partResultGroupBy[group] = 1
                                }
                            }
                            // handle select
                            else {
                                partResult.push(render(d, select))
                            }
                        }
                    }
                    if (groupby != undefined) {
                        partResult.push(partResultGroupBy)
                    }
                    resolve("Success");
                })
            }))
        }

        Promise.all(promises).then((unused) => {
            // Reduce
            res = ""
            if (groupby != undefined) {
                allResult = {}
                for (pr of partResult) {
                    for (group in pr) {
                        if (group in allResult) {
                            allResult[group] = allResult[group] + pr[group]
                        } else {
                            allResult[group] = pr[group]
                        }
                    }
                }
                for (group in allResult) {
                    res = res + group + ":" + allResult[group] + "\n"
                }
                callback([res, null])
            } else {
                for (const r of partResult) {
                    res = res + r + "\n"
                }
                callback([res, null])
            }
        })
    })
}

function render(obj, select) {
    var res = ""
    for (let str of select) {
        res = res + obj[str] + "\t"
    }
    return res
}

function compare(obj, con) {
    v1 = obj[con.attr]
    condition = con.method
    v2 = con.value
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

exports.mkdir = mkdir
exports.cd = cd
exports.ls = ls
exports.cat = cat
exports.rm = rm
exports.put = put
exports.getPartitionLocations = getPartitionLocations
exports.readPartition = readPartition
exports.doQuery = doQuery