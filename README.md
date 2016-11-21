 # bartificer.linkToolkit.js

A collection of utility functions for manipulating links in HTML pages.

Full documentation can be found at [https://bbusschots.github.io/bartificer_linkToolkit_js/](https://bbusschots.github.io/bartificer_linkToolkit_js/).

# Requirements

Be sure to inlude the [jQuery](http://jquery.com) library into the HTML document before including `bartificer.linkToolkit.js`.

Some functions also require that [URI.js](https://medialize.github.io/URI.js/) (including its optional jQuery plugin) be included in the HTML document.

# Usage

To use the library, first include jQuery, then `URI.js` with its optional jQuery addon, then `bartificer.linkToolkit.js` (which you'll find in the `lib` directory in this repository).

## Example (all code within the `head` of the HTML document)

```
<!-- Include jQuery and URI.js from CDNs -->
<script type="text/javascript" src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.3/URI.min.js" integrity="sha256-F0EBsZw531Ic566O5qfXoMLeSRgH2lkS5GYuUn+jkiY=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.3/jquery.URI.min.js" integrity="sha256-oXQ7kOcuQWuS1Haoc7SRvZm/Vid3a8Kf+jAvtUSJrqE=" crossorigin="anonymous"></script>

<!-- Inclide the library -->
<script type="text/javascript" src="bartificer.linkToolkit.js"></script>

<!-- Add a jQuery Document Ready Event Handler -->
<script type="text/javascript">
  $(function(){
  	// add a rel of noopener to all links with a target of _blank in the entire document
  	bartificer.linkToolkit.noopenerFix();
  	
  	// externalise all links that leave the site within a given set of container
  	bartificer.linkToolkit.autoExternalise(
  	  $('#main_content'),
  	  {
  	  	subDomainsLocal: true,
  	  	ignoreDomains: ['bartb.ie', 'www.bartb.ie']
  	  }
  	);
  });
</script>
```

# Development

To edit the library yourself, download the repo, then change to the folder, and run the following command to install all the dev requirements:

```
npm install
```

To generate the public documentation:

```
npm run generate-docs
```

To generate the developer documentation (including private members and functions);

```
npm run generate-docs-dev
```