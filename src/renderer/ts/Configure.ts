const fs = require('fs');
const devPath = "./build/config.json";
const prodPath = "./resources/app/build/config.json";
let path = "";
if (process.env.NODE_ENV === "production")
    path = prodPath
else
    path = devPath

const conf = require("../../config.json");
export let configure;
try {
    console.log("try reading config.json");
    configure = JSON.parse(fs.readFileSync(path, 'utf8'));
    configure.SystemDictionary.URL.pattern = conf.SystemDictionary.URL.pattern;
    configure.SystemDictionary.ImageExt = conf.SystemDictionary.ImageExt;
    fs.writeFileSync(path, JSON.stringify(configure));
    console.log("success reading config.json");
}
catch (e) {
    console.log(e);
    console.log("can't reading config.son");
    configure = conf;
    try {
        fs.writeFileSync(path, JSON.stringify(configure));
        console.log("writting new config.json");
    } catch (e) { }
}