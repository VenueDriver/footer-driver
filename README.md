# File Driver

A minimal, reusable standard page footer for Hakkasan Group web sites.

The footer can be included into web pages on the server side using your favorite server-side technology, or on the client side using lazy loading.  I recommend lazy loading the footer for better performance.

This project includes an HTML template for the footer, SCSS styling for that footer, and ERB templates that assemble the footer and styling into demo web pages that show how to include it on the server side or on the client side.

Each set of templates compiles to a raw-HTML version and also a minified version for use in production.

## Building

Run `ruby build.rb` to build output in `/build` from the templates
in `/templates`.

Run `ruby watch.rb` to watch the `/build` folder for changes.  For development.

## Deploying

To deploy, I simply copy files to S3:

    $ aws s3 sync --acl public-read ./build s3://staging.footers.hakkasangroup.com

    $ aws s3 sync --acl public-read ./build s3://footers.hakkasangroup.com

## Server-side includes

[build/index.html](build/index.html) demonstrates including the footer on the server side.  In this demo, the ERB template at [templates/index.html.erb](templates/index.html.erb) includes the CSS styling in the `<head>` section of the HTML document, and the footer contents separately in the `<body>` section.

If you want to do it this way, then you can include the file [build/styles.css](build/styles.css) or [build/styles.min.css](build/styles.min.css) for the styles, and [build/footer.html](build/footer.html) or [build/footer.min.html](build/footer.min.html) for the footer content.

If you do it this way, then the footer styling and HTML will be included in the initial page load.  Transferring those bytes will add extra time to the page load.  And the additional DOM nodes will slow down the initial page render.  If you want the best-possible Lighthouse performance scores for your initial page load, then you might want to consider using a lazy-loaded footer instead.

## Lazy-loaded client-side includes

[build/index.lazy-load.html](build/index.lazy-load.html) demonstrates including the footer on the server side.  In this demo, the ERB template at [templates/index.lazy-load.html.erb](templates/index.lazy-load.html.erb) includes pure Javascript code (no jQuery or other external dependency required) for fetching the [build/footer.min.json](build/footer.min.json) file and including it in the page.  That file includes both the footer contents and the styling.

If you want to do it this way, just copy that widget into your HTML.  It uses JSONP so that you don't need to worry about configuring CORS.  Want proof that it works from a different origin without CORS?  Here's a Codepen: https://codepen.io/endymion/pen/vYKNOOP
