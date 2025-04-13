<p align="center">
  <a href="https://www.metalsmith.io">
    <img alt="Metalsmith" src="https://www.glinka.co/assets/images/metalsmith-logo-bug.png" width="60" />
  </a>
</p>
<h1 align="center">
  Metalsmith2025 Simple Starter
</h1>

> This starter is still under development. Check back later!

Start off your Metalsmith journey with this blog boilerplate. This starter is based on the [Metalsmith bare-bones starter](https://github.com/wernerglinka/metalsmith-bare-bones-starter) but also includes a blog landing page and several "greek" blog posts. Check out a [demo of this starter](https://metalsmith-blog-starter.netlify.app/).

## Quick start

1.  **Create a Metalsmith site.**

    Clone the starter repository to create a new blog.

    ```shell
    git clone https://github.com/wernerglinka/metalsmith-blog-starter my-blog
    ```

1.  **Start developing.**

    Navigate into your new site’s directory and start it up.

    ```shell
    cd my-blog/
    npm install
    npm start
    ```

1.  **Open the source code and start editing!**

    Your site is now running at `http://localhost:3000`!

    Open the `blog` directory in your code editor of choice and edit any page. Save your changes and the browser will update in real time!

## What's included?

A quick look at the top-level files and directories you'll see in this Metalsmith project.

    .
    ├── node_modules/       # Dependencies
    ├── src/                # Source content (Markdown)
    │   └── blog/           # Blog posts
    ├── lib/                # Project assets and templates
    │   ├── assets/         # Static assets (CSS, images, etc.)
    │   ├── data/           # Site metadata (JSON)
    │   └── layouts/        # Nunjucks templates
    │       └── partials/   # Reusable template parts
    ├── nunjucks-filters/   # Custom Nunjucks filters
    ├── .eslintrc.js        # ESLint configuration
    ├── .gitignore          # Git ignore rules
    ├── .prettierignore     # Prettier ignore rules
    ├── .prettierrc         # Prettier configuration
    ├── LICENSE             # License file
    ├── metalsmith.js       # Metalsmith configuration
    ├── package-lock.json   # Dependency lock file
    ├── package.json        # Project manifest
    └── README.md           # Project documentation

1.  **`node_modules`**: This directory contains all the node modules that your project depends on.

2.  **`src`**: This directory will contain all the content that makes up your site.

3.  **`layouts`**: This directory will contain all the layout templates and template partials that will be used to render your site.

4.  **`.eslintrc.js`**: This file contains all rules for ESLint.

5.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

6.  **`.prettierignore`**: This file tells prettier what files it should ignore.

7.  **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

8.  **`LICENSE`**: This Metalsmith starter is licensed under the MIT license.

9.  **`metalsmith.js`**: This is the Metalsmith build file.

10. **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won’t change this file directly).**

11. **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

12. **`README.md`**: A text file containing useful reference information about your project.

## Learn more about Metalsmith

Looking for more guidance? Full documentation for Metalsmith can be found [on the Metalsmith website](https://www.metalsmith.io).

## Features

### Blog with Pagination

This starter includes a blog with pagination:

- **Collection-based**: Blog posts are organized in a collection for easy management.
- **Pagination**: The blog index page is paginated with configurable posts per page.
- **Navigation**: Pagination includes previous/next links and page numbers.
- **Featured Posts**: Support for featured blog posts that can be highlighted.

### SEO Features

This starter includes several SEO-friendly features:

- **Sitemap Generation**: A sitemap.xml file is automatically generated in production builds using the `metalsmith-sitemap` plugin.
- **Robots.txt**: A robots.txt file is included and processed with Nunjucks to include the correct sitemap URL.
- **404 Page**: A custom 404 error page that works with Netlify and other hosting providers.
- **SEO Metadata**: Each page can include custom title, description, and social image metadata.

## Deploy

Deploy and Host on any static hosting service. For example [Netlify](https://www.netlify.com), [Vercel](https://vercel.com/) or [Cloudflare Pages](https://pages.cloudflare.com/).

Here is an article about [how to deploy Metalsmith on Netlify](https://www.netlify.com/blog/2015/12/08/a-step-by-step-guide-metalsmith-on-netlify/).

## Join the Metalsmith community at [Gitter](https://gitter.im/metalsmith/community).