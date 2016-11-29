require('font-awesome/css/font-awesome.css');
import Application from "./ts/Application";
window.addEventListener("load", () => {
    var app = new Application();
    app.$mount("#app");

});

require("material-design-lite/material.css")
require("material-design-lite/material.js")
require("./css/main.less")
