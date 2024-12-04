/* global io */
const socket = io();

socket.emit("message", "I... am Steve");