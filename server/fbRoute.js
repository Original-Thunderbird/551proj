const fsCmd = require("./fbCmd");

function Route(cmd, params, filename, callback) {
    var err, content='', curDir='/';
    switch(cmd) {
        case 'mkdir':
            fsCmd.mkdir(params[0],function (result) {
                content = result;
                callback(result);
            });
            break;
        case 'cd':
            fsCmd.cd(params[0],function (result) {
                content = result;
                callback(result);
            })
        case 'ls':
            fsCmd.ls(params[0], function (result){
                content = result;
                callback(result);
            });
            break;
        case 'cat':
            fsCmd.cat(params[0],function (result) {
                callback(result)
            });
            break;
        case 'rm':
            fsCmd.rm(params[0],function (result) {
                callback(result)
            });
            break;
        case 'put':
            fsCmd.put(filename, params[0], params[1], function (result) {
                callback(result)
            });
            break;
        case 'getPartitionLocations':
            fsCmd.getPartitionLocations(params[0], function (res) {
                callback(res)
            });
            break;
        case 'readPartition':
            fsCmd.readPartition(params[0], params[1], callback);
            break;
        default:
            err = 'do not support such command';
            break;
    }
    return [content, err];
}
exports.Route = Route