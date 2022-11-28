const fs = require('fs')
const path = require("path");
const config = require("./config")
const {NULL} = require("mysql/lib/protocol/constants/types");

// function HandleQuery(raw,callback) {
//     var output = raw, err = "noob"
//     console.log("handleQuery")
//     // fill here
//     doQuery()
//
// }

function HandleQuery(query, callback) {
    var json = JSON.parse(query)
    var select = json.select;
    var from = json.from
    var where = json.where
    var groupby = json.groupby
    console.log("run")
    if(from.toUpperCase() == "STUDENT"){
        config.sqlDB.query("select GROUP_CONCAT(p.partno SEPARATOR ',') as pno from meta m join parts p on m.inumber = p.inumber where m.typ = 'fs'", (err, res)=>{
            var strs = res[0].pno.split(',')
            var result =[]
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
                    if(partResult.length!=0)
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
                            return callback([ret,''])
                        }
                        else{
                            console.log(result)
                            return callback([result,''])
                        }

                    }
                })
            }

        })
    }
    else if(from.toUpperCase() == "COMPANY"){
        config.sqlDB.query("select GROUP_CONCAT(p.partno SEPARATOR ',') as pno from meta m join parts p on m.inumber = p.inumber where m.typ = 'fc'", (err, res)=>{
            var strs = res[0].pno.split(',')
            var result = ''
            for(let j=0 ;j<strs.length; j++){
                let partResult = ''
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
                                partResult+=groupByRenderC(res[i], groupby)
                            }
                            else{
                                partResult+=renderC(res[i], select)
                            }

                        }
                    }
                    if(partResult.length!=0)
                        result+=partResult
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
                                ret = ret + key + "\t\t" + value + "\n"
                            }
                            console.log(ret)
                            return callback([ret,''])
                        }
                        else{
                            console.log(result)
                            return callback([result,''])
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
            res =  (obj.Hired=="1"||obj.Hired==1)?"Hired":"Not Hired"
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
                res = res + obj.ID + "\t"
                break;
            case "Name":
                res = res + obj.Name + "\t"
                break;
            case "SpecName":
                res = res + obj.SpecName + "\t"
                break;
            case "Hired":
                res = res + ((obj.Hired=="1"||obj.Hired==1)?"Hired":"Not Hired") + "\t"
                break;
            case "CompName":
                res = res + obj.CompName + "\t"
                break;
            case "Role":
                res = res + obj.Role + "\t"
                break;
        }
    }
    res = res + "\n"
    return res
}

function renderC(obj, select){
    var res = ""
    for(let str of select){
        switch (str) {
            case "Company":
                res = res + obj.Company + "\t"
                break;
            case "Industry":
                res = res + obj.Industry + "\t"
                break;
        }
    }
    res = res + "\n"
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
    if(v2==''||v2==null){
        return true
    }
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



exports.HandleQuery = HandleQuery