// Copyright 2021 HITCON Online Contributors
// SPDX-License-Identifier: BSD-2-Clause

// Boilerplate for getting the __dirname.
import url from 'url';
import path from 'path';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Boilerplate for getting require() in es module.
import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const express = require('express');

import {getRunPath, getConfigPath} from '../../common/path-util/path.mjs';

/**
 * Asset server serves static and dynamic assets.
 */
class AssetServer {
  /**
   * Create an asset server, but doesn't start it.
   * @constructor
   * @param {App} app - An express app or router compatible with express.js.
   * @param {ExtensionManager} extMan - An extension manager.
   */
  constructor(app, extMan, gatewayAddresses) {
    this.app = app;
    this.extMan = extMan;
    this.gatewayAddresses = gatewayAddresses;
  }

  /**
   * Initialize and start the asset server.
   */
  async initialize() {
    this.staticRoutes();
    await this.clientRoutes();
    this.extRoutes();
  }

  /**
   * Prepare the static routes.
   */
  async staticRoutes() {
    // TODO: Restrict the visible pages.
    // Not sure if all static files are in sites
    this.app.use('/static/sites', express.static(path.resolve(__dirname, '../../sites/')));
    this.app.use('/static/common', express.static(path.resolve(__dirname, '../../common/')));
    this.app.use('/static/run/map', express.static(getRunPath('map')));
    this.app.use('/static/run/hosted', express.static(getRunPath('hosted')));
    for (const extName of this.extMan.listExtensions()) {
      this.app.use(`/static/extensions/${extName}/common`,
        express.static(path.resolve(__dirname, `../../extensions/${extName}/common`)));
    }
  }

  /**
   * Prepare the route for serving the client.
   */
  async clientRoutes() {
    // We're using ejs;
    this.app.set('view engine', 'ejs');

    // Send the user to the game client page.
    this.app.get('/', (req, res) => {
      res.redirect('/client.html');
    });

    // Prepare the client params beforehand.
    this.clientParams = {};
    let partials = await this.extMan.collectPartials(this.extMan.listExtensions());
    this.clientParams.inDiv = [];
    if (typeof partials.inDiv == 'object') {
      this.clientParams.inDiv = partials.inDiv;
    }
    this.app.get('/client.html', (req, res) => {
      // TODO: workaround for development, in production we should fetch the unique endpoint from the config.
      this.clientParams.gatewayAddress = this.gatewayAddresses ? this.gatewayAddresses[Math.floor(Math.random() * this.gatewayAddresses.length)] : null;
      res.render(path.resolve(__dirname, '../../sites/game-client/client.ejs'), this.clientParams);
    });
    this.app.get('/health', (req, res) => {
      res.status(200).send('OK');
    });
  }

  /**
   * Prepare the routes for extensions.
   */
  extRoutes() {
    this.app.get('/list_extensions', (req, res) => {
      res.json(this.extMan.listExtensions());
    });
  }

  run() {
  }
}

export default AssetServer;
