const request = require('superagent');
const url = require('url');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const defaultPlaceholder = '<!--# include file="modules" -->';
const MANIFEST_PATH = `static/html/module-manifest.html`;

async function fetchManifest(modules) {
  let htmls = await Promise.all(
    modules.map(async m => {
      const uri = url.resolve(`${m.path}:${m.port}`, `${m.name}/${MANIFEST_PATH}`);
      // eslint-disable-next-line no-console
      console.info(`fetch manifest "${m.name}":`, uri);

      return await request
        .get(uri)
        .set('Accept', 'text/html')
        .then(res => {
          // eslint-disable-next-line no-console
          console.info(`manifest "${m.name}" fetched:`, res.text);

          return res.text;
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err.text ? err.text : String(err));
          return `<!-- fetch ${m.name} manifest failed -->`;
        });
    })
  );

  return _.uniq(htmls).join('\n');
}

async function readManifest(modules) {
  let htmls = await Promise.all(
    modules.map(async opt => {
      const filePath = path.join(
        __dirname,
        `../x-web/${opt.name}${opt.static}/module-manifest.html`
      );

      // eslint-disable-next-line no-console
      console.info(`read manifest "${opt.name}":`);

      return await readFile(filePath, 'utf8')
        .then(text => {
          // eslint-disable-next-line no-console
          console.info(`manifest "${opt.name}" read:`, text);

          return text;
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err.text ? err.text : String(err));
          return `<!-- read ${opt.name} manifest failed -->`;
        });
    })
  );

  return _.uniq(htmls).join('\n');
}

module.exports = function injectModule(modules, basePath) {
//   let fileHtmls;

  return function inject(__, res, next) {
    const send = res.send;
    res.send = function(body) {

      if (this.get('Content-Type') === 'text/html; charset=UTF-8') {
        if (body.indexOf(defaultPlaceholder) !== -1) {
          const httpHtmls = fetchManifest(modules);
        //   if (!fileHtmls) {
        //     fileHtmls = readManifest(modules.filter(a => a.static));
        //   }

          Promise.all([httpHtmls])
            .then(htmls =>
              htmls
                .filter(h => h)
                .join('\n')
                .replace(/{{BASE_PATH}}/g, basePath)
            )
            .then(html => {
              send.call(this, body.toString().replace(defaultPlaceholder, html));
            })
            .catch(err => {
              console.error(err); // eslint-disable-line no-console
              send.call(this, body);
            });

          return this;
        }
      }

      return send.call(this, ...arguments);
    };

    next();
  };
};
