const fsCmd = require("./cmd");

var curDir = "/"
var curInumber = 0

function getRealPath(path) {
    var str = path
    if(path===".."){
        var temp = curDir
        if(temp==="/"){
            //alert("No parent level")
        }
        else{
            var t = temp.split("/")
            t = t.slice(0,t.length-1)
            str = t.join("/")
        }
    }
    else if(!path.startsWith("/")){
        str = (curDir==="/"?"":curDir) +"/"+ str
    }
    return str
}

function Route(cmd, params, filename, callback) {
    var err, content='';
    switch(cmd) {
        case 'cd':
            var str = params[0]
            if(params[0]===".."){
                var temp = curDir
                if(temp==="/"){
                    //alert("No parent level")
                }
                else{
                    var t = temp.split("/")
                    t = t.slice(0,t.length-1)
                    str = t.join("/")
                }
            }
            else if(!params[0].startsWith("/")){
                str = (curDir==="/"?"":curDir) +"/"+ str
            }
            fsCmd.cd(str,function (result,ino) {
                if(result===""||result=="error"){
                    result = "/"
                }
                curDir = result
                curInumber = ino
                console.log(curInumber)
                return callback(result)
            });
            break;
        case 'mkdir':
            fsCmd.mkdir(curInumber, params[0],function (result) {
                content = result;
                callback(result);
            });
            break;
        case 'ls':

            fsCmd.ls(curInumber,function (result){
                content = result;
                callback(result);
            });
            //console.log(content);
            break;
        case 'cat':
            fsCmd.cat(getRealPath(params[0]),function (result) {
                callback(result)
            });
            break;
        case 'rm':
            fsCmd.rm(getRealPath(params[0]),function (result) {
                if(result=="0"){
                    callback("No such directory found")
                }
                else{
                    callback("Delete successfully")
                }

            });
            break;
        case 'put':
            fsCmd.put(filename, getRealPath(params[0]), params[1], function (result) {
                callback(result)
            });
            break;
        case 'getPartitionLocations':
            fsCmd.getPartitionLocations(getRealPath(params[0]), function (res) {
                callback(res)
            });
            break;
        case 'readPartition':
            fsCmd.readPartition(getRealPath(params[0]), params[1], callback);
            break;
        default:
            err = 'do not support such command';
            break;
    }
    return [content, err];
}
exports.curInumber = curInumber
exports.curDir = curDir
exports.Route = Route