module.exports = ((port, addtlContext, appMods) => new Promise(async (resolve, reject) => {
  const dir = require('path').dirname(require.main.filename);
  const URL = require('url');
  const vm = require('vm');
  const { EventEmitter } = require('events');
  const fs = require('fs');
  const promise = () => {
    let res = false;
    let ee = new EventEmitter;
    return {
      resolved: () => {
        return res;
      },
      resolve: () => {
        res = true;
        ee.emit('resolved');
      },
      onResolve: (callback) => {
        ee.once('resolved', callback);
      }
    }
  }
  const conf = require('../../easyconf.json');
  if (!conf.errors) throw new Error('Missing errors from easyconf.json');
  if (!conf.protected) throw new Error('Missing protected from easyconf.json');
  const express = require('express');
  const app = express();
  app.use(express.json({ extended: true }));
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    res.easy = (filepath) => {
      return new Promise(async (resolve, reject) => {
        if (filepath.endsWith('.html') || filepath.endsWith('.ezjs')) {
          let file = fs.readFileSync(filepath, 'utf8');
          const matches = file.match(new RegExp(`<;ezjs(.|\\n)*?;>`, 'g'));
          if (matches !== null) {
            for (var i = 0; i < matches.length; i++) {
            const match = matches[i];
              let results = '';
              const context = addtlContext || {};
              const pr = promise();
              context.require = require;
              context.console = console;
              context.__dirname = dir;
              context.process = process;
              context.request = {
                req: req,
                res: res,
                next: next,
                promise: pr
              };
              context.echo = (text) => {
                results += text;
              }
              vm.createContext(context);
              const code = match.substring(6, match.length - 2);
              vm.runInContext(code, context);
              if (context.async == true) {
                await new Promise((resolve, reject) => {
                  pr.onResolve(resolve);
                });
              }
              resolve(context);
              file = file.replace(match, results);
            }
          }
          res.send(file);
        } else {
          res.sendFile(filepath);
        }
      });
    }
    req.getPath = () => {
      let reqPath = URL.parse(req.url).pathname;
      if (reqPath == '/') reqPath += 'index';
      if (!fs.existsSync(dir + reqPath) || reqPath == '/') {
        if (!fs.existsSync(dir + reqPath + '.ezjs')) {
          if (fs.existsSync(dir + reqPath + '.html')) {
            reqPath += '.html';
          }
        } else {
          reqPath += '.ezjs';
        }
      }
      return dir + reqPath;
    }
    next();
  });
  app.get('*', async (req, res) => {
    const path = req.getPath();
    let protected = false;
    conf.protected.forEach(item => {
      if (path.substring(dir.length).startsWith(item)) protected = true;
    });
    if (protected) return conf.errors['403'] ? res.easy(dir + '/' + conf.errors['403']) : res.status(403).send('EASYJS 403 PROTECTED');
    if (!fs.existsSync(path)) return conf.errors['404'] ? res.easy(dir + '/' + conf.errors['404']) : res.status(404).send('EASYJS 404 NOT FOUND');
    return res.easy(path);
  });
  app.use(function (err, req, res, next) {
    return conf.errors['500'] ? res.easy(dir + '/' + conf.errors['500']) : res.status(500).send('EASYJS 500 INTERNAL SERVER ERROR');
  });
  const appmods = appMods(app);
  if (appmods instanceof Promise) await appmods;
  app.listen(port || 80, resolve);
}));
