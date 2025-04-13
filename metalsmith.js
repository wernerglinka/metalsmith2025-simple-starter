/**
 * Metalsmith Build Configuration
 *
 * This file configures how Metalsmith builds your site. Each section is documented
 * to help beginners understand what's happening at each step.
 */

// These are built-in Node.js modules needed for file paths and operations
import { fileURLToPath } from 'node:url'; // Converts file:// URLs to file paths
import path, { dirname } from 'node:path'; // Handles file paths across different OS
import * as fs from 'node:fs'; // File system operations (read/write files)

// The main Metalsmith library and plugins that transform your content
import Metalsmith from 'metalsmith'; // The core static site generator
import drafts from '@metalsmith/drafts'; // Excludes draft content from builds
import markdown from 'metalsmith-unified-markdown'; // Converts Markdown to HTML
import permalinks from '@metalsmith/permalinks'; // Creates clean URLs
import blogLists from 'metalsmith-blog-lists'; // Creates lists of blog posts
import menus from 'metalsmith-menu-plus'; // Generates navigation menus
import layouts from '@metalsmith/layouts'; // Applies templates to content
import assets from 'metalsmith-static-files'; // Copies static assets to build
import htmlMinifier from 'metalsmith-optimize-html'; // Minifies HTML in production
import sitemap from 'metalsmith-sitemap'; // Generates a sitemap.xml file
import simplePagination from 'metalsmith-simple-pagination'; // Creates paginated blog pages

import rehypeHighlight from 'rehype-highlight'; // Syntax highlighting for code blocks
import { performance } from 'perf_hooks'; // Measures build performance
import browserSync from 'browser-sync'; // Live-reload development server

// These variables help determine the current directory and file paths
const thisFile = fileURLToPath( import.meta.url ); // Gets the actual file path of this script
const thisDirectory = dirname( thisFile ); // Gets the directory containing this script
const mainFile = process.argv[ 1 ]; // Gets the file that was executed by Node.js

/**  
 * ESM (ECMAScript Modules) doesn't support importing JSON directly
 * So we read the package.json file manually to get dependency information
 * @type {Object}
 */
const dependencies = JSON.parse( fs.readFileSync( './package.json' ) ).dependencies;

/**
 * @function dataToNunjucksGlobals
 * @returns {Object} An object containing all JSON data files from lib/data directory
 *
 * This function reads all JSON files from the data directory and makes them
 * available to templates. For example, site.json becomes available as refData.site
 * in your templates.
 */
const dataToNunjucksGlobals = () => {
  const dataDir = path.join( thisDirectory, 'lib', 'data' ); // Path to data directory
  const files = fs.readdirSync( dataDir ); // Get all files in directory

  // Process each JSON file and add it to the result object
  return files.reduce( ( obj, file ) => {
    const fileName = file.replace( '.json', '' ); // Remove .json extension
    const fileContents = fs.readFileSync( path.join( dataDir, file ), 'utf8' );
    obj[ fileName ] = JSON.parse( fileContents ); // Parse JSON content
    return obj;
  }, {} );
};

// Extract the site URL from site.json for use in the sitemap plugin
const siteURL = dataToNunjucksGlobals().site.siteURL;

/**
 * TEMPLATE ENGINE SETU
 * Import custom Nunjucks filters that extend the template engine
 * These filters provide additional functionality like date formatting,
 * string manipulation, and more.
 */
import * as nunjucksFilters from './nunjucks-filters/index.js';

/**
 * Configuration options for the Nunjucks template engine
 * @type {Object}
 */
const engineOptions = {
  path: [ 'lib/layouts' ], // Where to find template files
  filters: nunjucksFilters, // Custom filters for templates
  globals: { refData: dataToNunjucksGlobals() } // Global data available to all templates
};

/**
 * ENVIRONMENT SETUP
 * Determine if we're in production mode based on NODE_ENV environment variable
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV !== 'development';

// Variable to hold the development server instance
let devServer = null;

/**
 * Create a new Metalsmith instance
 * This is the core object that will build our site
 * @type {Metalsmith}
 */
const metalsmith = Metalsmith( thisDirectory );

/**
 * Configure the basic Metalsmith settings
 * These determine how Metalsmith will process our files
 */
metalsmith
  .clean( true ) // Clean the destination directory before building
  .ignore( [ '**/.DS_Store' ] ) // Ignore macOS system files
  .watch( isProduction ? false : [ 'src', 'lib/layouts', 'lib/assets' ] ) // Watch for changes in development mode only
  .env( 'NODE_ENV', process.env.NODE_ENV ) // Pass NODE_ENV to plugins
  .source( './src' ) // Where to find source files
  .destination( './build' ) // Where to output the built site
  .metadata( { // Global metadata available to all files
    msVersion: dependencies.metalsmith, // Metalsmith version
    nodeVersion: process.version // Node.js version
  } )

  // Exclude draft content in production mode
  .use( drafts( !isProduction ) )

  // Create paginated blog pages
  .use(
    simplePagination( {
      directory: 'blog', // Directory containing blog posts
      perPage: 2, // Number of posts per page
      sortBy: 'post.date', // Sort posts by date
      reverse: true, // Newest posts first
      outputDir: 'blog/:num', // Output pattern for pagination pages
      indexLayout: 'blog.njk', // Template for blog index pages
      firstIndexFile: 'blog.md', // Source file for first page
      usePermalinks: true  // Use clean URLs
    } )
  )

  // Generate lists of blog posts (latest, featured)
  .use(
    blogLists( {
      latestQuantity: 4, // Number of posts in latest list
      featuredQuantity: 2, // Number of posts in featured list
      featuredPostOrder: 'desc', // Sort order for featured posts
      fileExtension: '.md', // File extension for blog posts
      blogDirectory: './blog', // Directory containing blog posts
      blogObject: 'post' // Object name for blog post metadata
    } )
  )

  // Convert Markdown to HTML with syntax highlighting
  .use(
    markdown( {
      engineOptions: {
        extended: {
          rehypePlugins: [ rehypeHighlight ] // Add syntax highlighting
        }
      }
    } )
  )

  // Create clean URLs (e.g., /about/ instead of /about.html)
  .use( permalinks() )

  // Generate navigation menus
  .use(
    menus( {
      metadataKey: 'mainMenu', // Where to store menu data
      usePermalinks: true, // Use clean URLs in menu
      navExcludePatterns: [ '404.html', 'robots.txt' ] // Files to exclude from menu
    } )
  )

  // Apply templates to content
  .use(
    layouts( {
      directory: 'lib/layouts', // Where to find templates
      transform: 'nunjucks', // Template engine to use
      pattern: [ '**/*.html', '**/robots.txt' ], // Files to apply templates to
      engineOptions  // Options for the template engine
    } )
  )

  // Copy static assets to the build directory
  .use(
    assets( {
      source: 'lib/assets/', // Where to find assets
      destination: 'assets/' // Where to copy assets
    } )
  );

// These plugins only run in production mode to optimize the site
if ( isProduction ) {
  metalsmith
    // Minify HTML to reduce file size
    .use( htmlMinifier() )

    // Generate a sitemap.xml file for search engines
    .use(
      sitemap( {
        hostname: siteURL, // Your site's URL
        omitIndex: true, // Remove index.html from URLs
        omitExtension: true, // Remove .html extensions
        changefreq: 'weekly', // How often pages change
        lastmod: new Date(), // Last modification date
        pattern: [ '**/*.html', '!**/404.html' ], // Include all HTML except 404
        defaults: {
          priority: 0.5, // Default priority for pages
          changefreq: 'weekly', // Default change frequency
          lastmod: new Date() // Default last modified date
        }
      } )
    );
}

/**
 * BUILD EXECUTION
 * This section handles the actual build process and development server
 * It only runs when this file is executed directly (not when imported)
 */
if ( mainFile === thisFile ) {
  // Start timing the build for performance measurement
  let t1 = performance.now();

  // Execute the Metalsmith build
  metalsmith.build( ( err ) => {
    // Handle any build errors
    if ( err ) {
      throw err;
    }

    // Log build success and time taken
    /* eslint-disable no-console */
    console.log( `Build success in ${ ( ( performance.now() - t1 ) / 1000 ).toFixed( 1 ) }s` );

    // If watch mode is enabled, set up the development server
    if ( metalsmith.watch() ) {
      if ( devServer ) {
        // If server already exists, just reload it
        t1 = performance.now();
        devServer.reload();
      } else {
        // Otherwise, create a new BrowserSync server
        devServer = browserSync.create();
        devServer.init( {
          host: 'localhost', // Server hostname
          server: './build', // Directory to serve
          port: 3000, // Server port
          injectChanges: false, // Don't inject CSS changes, reload page
          reloadThrottle: 0 // Don't throttle reloads
        } );
      }
    }
  } );
}

// Export the Metalsmith instance for use in other files
export default metalsmith;
