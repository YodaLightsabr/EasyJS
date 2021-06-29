# EasyJS
The easiest JavaScript webserver
--------------------------------

Making a personal website and want to add some dynamic content? Want to protect your website's logic? Want to keep your server side and client side code on the same page? Like the way that PHP is set up with PHP code on each page? If you can answer "YES" to any of these, EasyJS is for you.

## Example
index.js
```js
require('easyjavascript')(8080).then(() => console.log('EasyJS started on *:8080'));
```
index.ezjs
```html
<!DOCTYPE html>
<html>
  <head>
    <title>EasyJS demo</title>
  </head>
  <body>
    <;ezjs
      echo("<p>Hello there!</p>");
    ;>
  </body>
</html>
```

## Async Example
index.js
```js
require('easyjavascript')(8080).then(() => console.log('EasyJS started on *:8080'));
```
index.ezjs
```html
<!DOCTYPE html>
<html>
  <head>
    <title>EasyJS demo</title>
  </head>
  <body>
    <;ezjs
      this.async = true;
      (async () => {
        setTimeout(() => {
          this.promise.resolve();
        }, 1000);
      })();
    ;>
  </body>
</html>
```

## Server Documentation
easyjs (`port`, `defaultContext`, `appModifiers`)
 - `port` - port to open
 - `defaultContext` - default global variable for EasyJS
 - `appModifiers` - a function that passes the Express `app` if you need to add middleware, routes, etc.

returns `Promise<>`

## `.ezjs` Documentation
Global Variables:
 - `require()` - [ native code ]
 - `console` - [ native code ]
 - `__dirname` - [ native code ]
 - `process` - [ native code ]
 - `request`
   - `req` - Express req object
   - `res` - Express res object
   - `next` - Express next function
   - `promise` - Promise to resolve
- `echo()` - Echo an output to the page

## `easyconf.json` Documentation
```json
{
  "ver": "1.0", // Version - 1.0
  "protected": [ // Protected routes; returns 403 error when accessed
    "/index.js",
    "/easyconf.json",
    "/node_modules"
  ],
  "errors": { // Error pages
    "404": "404.ezjs"
  }
}
```
