import { fileURLToPath } from 'node:url';
import path, { dirname } from 'node:path';

import Metalsmith from 'metalsmith';
import drafts from '@metalsmith/drafts';
import markdown from 'metalsmith-unified-markdown';
import permalinks from '@metalsmith/permalinks';
import blogLists from 'metalsmith-blog-lists';
import menus from 'metalsmith-menu-plus';
import layouts from '@metalsmith/layouts';
import assets from 'metalsmith-static-files';
import htmlMinifier from 'metalsmith-optimize-html';
import sitemap from 'metalsmith-sitemap';
import simplePagination from 'metalsmith-simple-pagination';

import rehypeHighlight from 'rehype-highlight';

import { performance } from 'perf_hooks';
import browserSync from 'browser-sync';

const thisFile = fileURLToPath(import.meta.url);
const thisDirectory = dirname(thisFile);
const mainFile = process.argv[1];

// ESM does not currently import JSON modules by default.
// Ergo we'll JSON.parse the file manually
import * as fs from 'node:fs';
const dependencies = JSON.parse(fs.readFileSync('./package.json')).dependencies;

/**
 * @function dataToNunjucksGlobals
 * @returns {Object} An object of objects with the file name as the key and
 *  the file content as the value
 *
 * This function adds metadata files to the build process programmatically.
 */
const dataToNunjucksGlobals = () => {
  const dataDir = path.join(thisDirectory, 'lib', 'data');
  const files = fs.readdirSync(dataDir);
  return files.reduce((obj, file) => {
    ``;
    const fileName = file.replace('.json', '');
    const fileContents = fs.readFileSync(path.join(dataDir, file), 'utf8');
    obj[fileName] = JSON.parse(fileContents);
    return obj;
  }, {});
};

// get siteURL from lib/data/site.json for sitemap use below
const siteURL = dataToNunjucksGlobals().site.siteURL;

/**
 * engineOptions
 * @type {Object}
 * @description This object is passed to the layouts plugin and allows us to
 *  pass options to the Nunjucks templating engine.
 */
import * as nunjucksFilters from './nunjucks-filters/index.js';

const engineOptions = {
  path: ['lib/layouts'],
  filters: nunjucksFilters,
  globals: { refData: dataToNunjucksGlobals() }
};

const isProduction = process.env.NODE_ENV !== 'development';
let devServer = null;

/** @type {Metalsmith} */
const metalsmith = Metalsmith(thisDirectory);

metalsmith
  .clean(true)
  .ignore(['**/.DS_Store'])
  .watch(isProduction ? false : ['src', 'lib/layouts', 'lib/assets'])
  .env('NODE_ENV', process.env.NODE_ENV)
  .source('./src')
  .destination('./build')
  .metadata({
    msVersion: dependencies.metalsmith,
    nodeVersion: process.version
  })

  .use(drafts(!isProduction))

  .use(
    simplePagination({
      directory: 'blog',
      perPage: 2,
      sortBy: 'post.date',
      reverse: true,
      outputDir: 'blog/:num',
      indexLayout: 'blog.njk',
      firstIndexFile: 'blog.md',
      usePermalinks: true
    })
  )

  .use(
    blogLists({
      latestQuantity: 4,
      featuredQuantity: 2,
      featuredPostOrder: 'desc',
      fileExtension: '.md',
      blogDirectory: './blog',
      blogObject: 'post'
    })
  )

  .use(
    markdown({
      engineOptions: {
        extended: {
          rehypePlugins: [rehypeHighlight]
        }
      }
    })
  )

  .use(permalinks())

  .use(
    menus({
      metadataKey: 'mainMenu',
      usePermalinks: true,
      navExcludePatterns: ['404.html', 'robots.txt']
    })
  )

  .use(
    layouts({
      directory: 'lib/layouts',
      transform: 'nunjucks',
      pattern: ['**/*.html', '**/robots.txt'],
      engineOptions
    })
  )

  .use(
    assets({
      source: 'lib/assets/',
      destination: 'assets/'
    })
  );

if (isProduction) {
  metalsmith
    .use(htmlMinifier())

    // Add sitemap in production builds
    .use(
      sitemap({
        hostname: siteURL,
        omitIndex: true,
        omitExtension: true,
        changefreq: 'weekly',
        lastmod: new Date(),
        pattern: ['**/*.html', '!**/404.html'],
        defaults: {
          priority: 0.5,
          changefreq: 'weekly',
          lastmod: new Date()
        }
      })
    );
}

// Check if this file is being executed directly (not imported as a module)
if (mainFile === thisFile) {
  // This block only runs when the file is executed directly (e.g., "node metalsmith.js")
  // When imported by the Metalsmith CLI (e.g., "metalsmith -c metalsmith.js"), this block is skipped
  // This prevents duplicate builds and allows the file to export the Metalsmith instance
  let t1 = performance.now();
  metalsmith.build((err) => {
    if (err) {
      throw err;
    }
    /* eslint-disable no-console */
    console.log(`Build success in ${((performance.now() - t1) / 1000).toFixed(1)}s`);
    if (metalsmith.watch()) {
      if (devServer) {
        t1 = performance.now();
        devServer.reload();
      } else {
        devServer = browserSync.create();
        devServer.init({
          host: 'localhost',
          server: './build',
          port: 3000,
          injectChanges: false,
          reloadThrottle: 0
        });
      }
    }
  });
}

export default metalsmith;
