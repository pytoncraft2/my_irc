const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const express = require('express');
const port = process.env.PORT || 8000;

const users = [];
const messages = {
  general: [],
  random: [],
  jokes: [],
  javascript: []
}

io.on('connection', (socket) => {

  /**
   * CONNEXION
   *
   * Ajoute au tableau users les nouveaux utilisateurs avec un pseudo + leur id
   * Envoie info d'un nouvelle utilisateur
   * @param  {String} username pseudo du login
   * @return {[type]}          [description]
   */

  socket.on('join server', function(username) {
    const user = {
      username,
      id: socket.id
    };
    users.push(user);
    io.emit('new user', users);
  });


  /**
   * REJOINDRE LE CHANNEL
   * Ajouter un Channel + un tableau vide de message par default
   * @type {Object}
   */

  socket.on('join room', (roomName, cb) => {
    socket.join(roomName.room);
    cb(messages[roomName.room]);
    // io.emit("info", roomName.pseudo+" a rejoint le salon "+roomName.room);
    io.emit("info", {msg: roomName.pseudo+" a rejoint le salon "+roomName.room, room: roomName.room, pseudo: roomName.pseudo});

    // io.to(roomName).emit('joined');
  });

  /**
   * QUITTER UN CHANNEL
   * @param { Object } roomName nom du channel
   * @type {String}
   */

  socket.on('leave room', (roomName) => {
    socket.leave(roomName.room);
    io.emit("info", {msg: roomName.pseudo+" est parti du salon "+roomName.room, room: roomName.room});
  });

  /**
   * CREATION CHANNEL
   *
   * Definit les messages du nouveau channel à vide
   * Envoie info de la creation du nom du nouveau channel
   * @type {Object}
   */

  socket.on('new channel', (res) => {
    messages[res.channelName] = [];
    io.emit('create new channel', {author: res.author, channelName: res.channelName});
  });

/**
 * SUPPRESSION CHANNEL
 *
 * Recupere l'id du channel à supprimer
 * @type {Object} id
 *
 */

  socket.on('delete channel', (res) => {
    io.emit('delete', res.i);
    io.emit("info", {msg: "le channel "+res.name+" a était supprimé", room: ""});

  });

  /**
   * ENVOIE MESSAGE
   *
   * Si le destinataire est un channel , envoie les donnés
   * Si c'est un utilisateur le nom du channel devient le nom du destinataire
   * Définis les nouveaux messages dans le tableau messages
   * @type {Object}
   */

  socket.on('send message', ({
    content,
    to,
    sender,
    chatName,
    isChannel
  }) => {

    if (isChannel) {
      const payload = {
        content,
        chatName,
        sender,
      };
      socket.to(to).emit("new message", payload);
    } else {
      const payload = {
        content,
        chatName: sender,
        sender,
      };
      socket.to(to).emit("new message", payload);
    }

    if (messages[chatName]) {
      messages[chatName].push({
        sender,
        content
      });
    }
  });

  /**
   * DECONNEXION
   * @type {[type]}
   */
  socket.on('disconnect', () => {
    users = users.filter(u => u.id !== socket.id);
    // io.emit("remove user", users);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
