'use strict';

let ENV = require('dotenv');
ENV.config();

process.env.rootdirname = __dirname;

let TRComm = require('./classes/TloRComm');
global.PLAYER = new TRComm();

