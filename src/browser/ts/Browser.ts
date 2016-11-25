"use strict";
import * as Vue from "Vue";
import { Component } from "vue-typed"
import * as io from "socket.io-client";
require("../css/main.css")

@Component()
export default class Browser extends Vue {
  speaker: Speaker;
  message = "";
  width = 600;
  height = 300;
  font_size = 10;
  constructor() {
    super();
  }
  onMessage(message: string) {
    this.message = message;
  }
  onResize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  onAa(aa: string) {
    this.message = aa;
  }

}
window.addEventListener("load", () => {
  var app = new Browser();
  app.$mount("#app");
  var socket = io.connect();
  socket.on('message', function (msg) {
    app.onMessage(msg);
  });
  socket.on('resize', function (msg) {
    app.onResize(msg.width, msg.height);
  });
  socket.on('aa', function (msg) {
    app.onAa(msg);
  });
});
