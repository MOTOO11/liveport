"use strict";
import * as Vue from "Vue";
import { Component } from "vue-typed"
import * as io from "socket.io-client";

@Component()
export default class Browser extends Vue {
  speaker: Speaker;
  message = 'Hello Vue!';
  width = 600;
  height = 300;
  constructor() {
    super();
  }
  onMessage(message: string) {
    this.message = message;
  }
  onResize(width, height) {
    this.width = width;
    this.height = height;
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
});
