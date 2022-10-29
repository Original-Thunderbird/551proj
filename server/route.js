const fsCmd = require("./cmd");

function Route(cmd, params, filename, callback) {
    var err, content='', curDir='/';
    switch(cmd) {
        case 'cd':
            [content, err] = fsCmd.cd(params[0]);
            break;
        case 'mkdir':
            [content, err] = fsCmd.mkdir(params[0]);
            break;
        case 'ls':

            fsCmd.ls(params[0],function (result){
                content = result;
                callback(result);
                console.log(result)});
            console.log(content);
            break;
        case 'cat':
            [content, err] = fsCmd.cat(params[0]);
            break;
        case 'rm':
            [content, err] = fsCmd.rm(params[0]);
            break;
        case 'put':
            [content, err] = fsCmd.put(filename, params[0], params[1]);
            break;
        case 'getPartitionLocations':
            [content, err] = fsCmd.getPartitionLocations(params[0]);
            break;
        case 'readPartition':
            [content, err] = fsCmd.readPartition(params[0], params[1]);
            break;
        default:
            err = 'do not support such command';
            break;
    }
    return [content, err];
}

exports.Route = Route