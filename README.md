# Engrid Multistep Embedded

This project makes it easy to create Multistep Donations Forms on Engaging Networks to embed as an iFrame on your website.

## How to use

1. Add the script below to the page:

```html
<script
  defer="defer"
  src="https://acb0a5d73b67fccd4bbe-c2d8138f0ea10a18dd4c43ec3aa4240a.ssl.cf5.rackcdn.com/10089/donation-multistep-parent.js"
></script>
```

2. Add the iFrame with `dm-iframe` id to the page:

```html
<iframe
  id="dm-iframe"
  data-src="https://donate.shatterproof.org/page/42322/donate/1?mode=DEMO&assets=local&debug=false"
  data-form_color="#f26722"
></iframe>
```

You can set a custom color for the form by setting the `data-form_color` attribute.
Please note that you should set the `src` attribute as `data-src` to prevent the form from loading twice. The script will take the iFrame element and append it to a wrapper, adding the necessary attributes to the iFrame and changing the `src` attribute to the actual form URL.

### IMPORTANT: This project only works with the Engaging Networks Pages using the [engrid theme](https://github.com/4site-interactive-studios/engrid).

## Development

Your js code must be on the `src/app` folder. Styling changes must be on `src/scss`.

## Install Dependencies

1. `npm install`

## Deploy

1. `npm run build` - Builds the project
2. `npm run watch` - Watch for changes and rebuilds the project

It's going to create a `dist` folder, where you can get the `donation-multistep-parent.js` file and publish it.

Currently it's published on (Shatterproof):  
https://acb0a5d73b67fccd4bbe-c2d8138f0ea10a18dd4c43ec3aa4240a.ssl.cf5.rackcdn.com/10089/donation-multistep-parent.js
