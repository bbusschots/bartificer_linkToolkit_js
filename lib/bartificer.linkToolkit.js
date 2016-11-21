/**
* @overview A collection of JavaScript functions for sanitising links in HTML pages in various ways.
*     This API is entirely contained within the namespace {@link bartificer.linkToolkit}.
* @author Bart Busschots
* @license BSD-2-Clause
*/

//
// === Add needed JSDoc data type definitions ===
//

/**
* An object created using `{}` or `new Object()`. jQuery's `$.isPlainObject()` function is used to
* validate this datatype.
* @typedef {Object} PlainObject
*/

/**
* A jQuery instance.
* @typedef {Object} jQueryObject
*/


// make sure the needed pre-requisites are installed.
if(typeof jQuery !== 'function'){
	throw new Error('jQuery is required but not loaded');
}

// init the bartificer namespace safely
var bartificer = bartificer ? bartificer : {};

// add all the API's functionality within a self-executing anonymous function
(function(bartificer, $, undefined){
	// initialise the bartificer.linkToolkit namespace
	/**
	* A colleciton of functions for sanitising links in HTML pages. The functions in this API depend on jQuery.
	* Some functions also depend on URI.js (including its optional jQuery extension). jQuery must be loaded 
	* into the document before `bartificer.linkToolkit.js`.
	*
	* All the functions in this API alter selective link tags in some way. All functions will ignore links
	* with the CSS class `bartificer-ignore`.
	*
	* @requires jQuery
	* @namespace
	*/
	bartificer.linkToolkit = {};
	
	//
	// === Private Variables/Functions ===
	//
	
	/**
	* A flag to hold debug status.
	* @memberof bartificer.linkToolkit
	* @type {boolean}
	* @private
	* @inner
	*/
	var _doDebug = false;
	
	/**
	* Log one or more items to the console if, and only if, debug mode is enabled (`doDebug` is `true`).
	* @memberof bartificer.linkToolkit
	* @inner
	* @private
	* @param {...*} items - The items to log
	*/
	var _debug = function(){
		if(_doDebug){
			console.trace.apply(console, arguments);
		}
	};
	
	/**
	* Ensure URI.js is loaded.
	* @memberof bartificer.linkToolkit
	* @inner
	* @private
	* @throws {Error} Throws an exception if `URI.js` is not loaded (including its jQuery plugin).
	*/
	var _assertURILoaded = function(){
		if(typeof URI !== 'function'){
			throw new Error('URI.js is required but not loaded');
		}
		if(typeof $('<a />').uri !== 'function'){
			throw new Error('The loaded build of URI.js does not contain the required jQuery integration');
		}
	};
	
	/**
	* The Data URL for the external link icon
	* @memberof bartificer.linkToolkit
	* @inner
	* @private
	*/
	var _externalLinkIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAg9JREFUeNqkU89rE0EYfbubjZu4pLWSipfGqlQpelARb7YgHhTBgwfRRVCKepSCRYoHLyJi/wM96KW5CR48qYfmUKjStMGghZY2irHNNptoStptsj/Gb6Z0cRs95cGbGXbe9775Zr+RGGNoBxE+nLv9EYqiiA89PQfELEnSBHHgX0GUNPNidO9gYPA3THMFup6AqqrPj6TUgYe3ki0GNx4VA2N552aj0UClUiZa6U+fy8adx4tYrTohTb1eR8iAMf+K53lLRLbNTt1nutYcX/xuoWRthgzW1mqhenD66rulyVmL+b4fcHauys5ce89mvv5iHNNfKmx5dUOsSc8nESuG/ktvRNZmsymYn7fYxbsfWJaCOKgUxjXnh0SgWG8byFt1O3BdFxSMb8UaXr5ewJN7x9F/MI6pXAnG/Qkk90RR+FEzjJGM0O+4A1kYVH/bmJwxcf3CPiQ7PGTzJTwYm8az4T7SSPB9KT2VswxaZ0IGiqLBcTwsmxs40RdHV0JF0Wxg/O1PjA4dwrHDHVgp+6SL8Q5JEwdDjRSN6nR8D8nOXSSSsL7JkF+wcfNyCt1dKm8qoeFwXYWSrYc7UdMSdEQVsVgEns/IwMHZU93Q40og5JotJOgOai0Ghdy833vyaAwR+jOp/RpkWQpE2TlbaFrNghJ2jzx9ZY8Bdu9/3kyBa6jhWjakdl+jjDbxR4ABAPjFI5E3WpRkAAAAAElFTkSuQmCC';
	
	/**
	* Add an icon to a URL.
	*
	* As this is a private inner function, there is no data validation performed on the arguments.
	*
	* @param {jQueryObject} $a - A jQuery object representing exactly one link.
	* @param {PlainObject} opts - Configuration Options
	* @param {string} [opts.iconSrc] - The value to use for the icon image's `src` attribute. By default, a data attribute is used.
	* @param {boolean} [opts.iconExternal=true] - If `true`, the icon image will be added after the link (with jQuery's `.after()`
	*     function), otherwise, it will be added to the end of the link (with jQuery's `.append()` function).
	* @param {string} [opts.iconClasses=''] - Additional classes to add to the icon image as a singel space-separated string.
	* @param {string} [opts.altText='External Link Icon'] - The alternative text for the icons.
	* @param {string} [opts.titleText='Link Opens in New Window/Tab'] - The title text for the icons.
	*/
	var _addIconToLink = function($a, opts){
		// create the icon
		var $icon = $('<img />').attr('src', opts.iconSrc).attr('alt', opts.altText).attr('title', opts.titleText);
		$icon.addClass('bartificer-externalLink');
		if(opts.iconClasses){
			$icon.addClass(opts.iconClasses);
		}
		
		// inject it into the DOM
		if(opts.iconExternal){
			$a.after($icon);
		}else{
			$a.append($icon);
		}
		
		// add the class to the link
		$a.addClass('bartificer-externalLink');
	};
	
	/**
	* Add noopener to the rel attribute of a link.
	*
	* As this is a private inner function, there is no data validation performed on the arguments.
	*
	* @memberof bartificer.linkToolkit
	* @inner
	* @private
	* @param {jQueryObject} $a - A jQuery object representing exactly one link.
	* @returns {boolean} - `true` if the link (`$a`) was altered, `false` otherwise.
	*/
	var _addRelNoopenerToLink = function($a){
		var linkAltered = false;
		if(!$a.attr('rel')){
			// there is no rel attribute at all, so simply set it
			$a.attr('rel', 'noopener');
			linkAltered = true;
			_debug('added rel attribute', $a);
		}else{
			// there already is a rel attribute, so first check if it already specifies noopener
				
			// explode the existing rel value, and check each part to see if it is noopener
			var relParts = $a.attr('rel').split(' ');
			for(var i = 0; i < relParts.length; i++){
				if(relParts[i] == 'noopener'){
					_debug('skipping - rel already contains noopener', $a);
					return; // the link is good - so skip it
				}
			}
				
			// if we got to here, noopener was not found in the rel value, so append it
			relParts.push('noopener');
			$a.attr('rel', relParts.join(' '));
			linkAltered = false;
			_debug('skipping - appended noopener to existing rel attribute', $a);
		}
		return linkAltered;
	};
	
	//
	// === The public functions ===
	//
	
	/**
	* Get or set the debug status. When debug mode is enabled, messages will be logged to the web/JavaScript
	* console with `console.trace()`. Since Versions of IE before 11 don't support `console.trace`, don't
	* enable debug mode on a live site.
	*
	* @param {boolean} [doDebug] If this parameter is passed, the debug mode will be set accordingly.
	* @returns {boolean} `true` is debug mode is enabled, `false` otherwise.
	* @example
	* // get the debug status
	* if(bartificer.linkToolkit.debug()){
	*   window.alert('debug mode ENABLED');
	* }else{
	*   window.alert('debug mode DISABLED');
	* }
	*
	* // enable debug mode
	* bartificer.linkToolkit.debug(true);
	*
	* // disable debug mode
	* bartificer.linkToolkit.debug(false);
	*/
	bartificer.linkToolkit.debug = function(){
		if(arguments.length){
			_doDebug = arguments[0] ? true : false;
		}
		return _doDebug;
	}
	
	/**
	* A function to test if a given URL is *local* to the current domain or not. All relative URLs are
	* considered local, as are URLs with the same host component as the current page. URLs with host
	* components that are subdomains of the host component of the current pages can optionally also be
	* considered local.
	*
	* @param {string} url - The URL to test.
	* @param {PlainObject} [opts] - A plain object containing configuration information.
	* @param {boolean} [opts.subDomainsLocal=true] - Whether or not subdomains of the current domain should
	*     be considered local.
	* @param {string[]} [opts.localDomains=[]] - Links to domains in this array will be considered local.
	* @returns {boolean} `true` if the link is local, `false` otherwise. Values that are not strings or
	*     numbers will always return `false`. The empty string is a relative URL to the current page, so it
	*     will return `true`.
	* @requires URI
	* @throws {Error} Throws an exception if `URI.js` is not loaded.
	* @example
	* // test if a URL is local to the current website (default settings)
	* var isLocal = bartificer.linkToolkit.isLocalUrl('http://www.bartb.ie/test');
	*
	* // test if a URL is local to the current site - subdomains exluded and alternative domain
	* // explicitly marked as local
	* var isLocal = bartificer.linkToolkit.isLocalUrl(
	*   'http://www.bartb.ie/test',
	*   {
	*     subDomainsLocal: false,
	*     localDomains: ['bartbusschots.ie', 'www.bartbusschots.ie']
	*   }
	* );
	*/
	bartificer.linkToolkit.isLocalUrl = function(url, opts){
		// make sure URI.js is loaded
		_assertURILoaded();
		
		// process the arguments
		if(typeof url === 'number'){
			url = '' + url;
		}
		if(typeof url !== 'string'){
			return false; // short-circuit non-strings
		}
		if(url === ''){
			return true; // short-circuit the empty string
		}
		if(!$.isPlainObject(opts)){
			opts = {};
		}
		opts.subDomainsLocal = typeof opts.subDomainsLocal === 'boolean' ? opts.subDomainsLocal : true;
		opts.localDomains = $.isArray(opts.localDomains) ? opts.localDomains : [];
		
		// create a URI object from the URL
		var urlObj = new URI(url);
		
		// return true if the URL is relative
		if(urlObj.is('relative')){
			return true;
		}
		
		// check the URL against the list of local domains, and return true on match
		for(var i = 0; i < opts.localDomains.length; i++){
			if(urlObj.hostname() == opts.localDomains[i]){
				return true;
			}
		}
		
		// create a URI object for the current URL of the current page
		var pageUrlObj = new URI();
		
		// if the domains exactly match, return true
		if(urlObj.hostname() == pageUrlObj.hostname()){
			return true;
		}
		
		// if needed, check for a subdomain
		if(opts.subDomainsLocal){
			// explode the domain for the current page into parts, and reverse them
			var pageDomainParts = pageUrlObj.hostname().split('.').reverse();
			
			// explode the domain part of the URL into parts, and reverse them
			var urlDomainParts = urlObj.hostname().split('.').reverse();
			
			// check the domains agianst each other - the entire page domain must
			// be in the URL domain for it to be a sub domain
			var isSubDomain = true; // assume it is a sub domain, then test that assumption
			for(var i = 0; isSubDomain && i < pageDomainParts.length; i++){
				if(pageDomainParts[i] !== urlDomainParts[i]){
					isSubDomain = false;
				}
			}
			
			// if it is a sub domain, return true
			if(isSubDomain){
				return true;
			}
		}
		
		// if we got here, the URL cannot be considered local, so return false
		return false;
	};
	
	/**
	* To counter-act a known security vulnerability, it's good practice to set the `rel` attribute of all
	* links that have a `target` of `_blank` to `noopener`. By default, when a new window/tab is opened by
	* a web page, the web page that loads into that newly created window/tab will contain a JavaScript object
	* named `opener` that points back to the window/tab that created it. While JavaScript's cross-domain rules
	* prevent this object from doing many things, they do not prevent the objet from doing everything, so
	* a page opened by clicking on a link with a `target` of `_blank` can do some neferious things, including
	* altering the URL in the opening window. This could facilitate a convincing phishing attack.
	*
	* This function scans the entire document, or a sub-set of the document, for links that have a `target` of
	* `_blank`, and adds a `rel` of `noopener` to any that do not already have it. The HTML specification
	* states that the rel attribute can have multiple space-separated values, so, this function will append
	* `noopener` to any `rel` attributes that already exist, but do not contain the value `noopener`.
	*
	* The function will skip any links that have any of the CSS classes `bartificer-ignore`, or 
	* `bartificer-noopener-ignore`.
	* 
	* The function can also be fine-tuned to skip all *local* links and all links to a list of white-listed
	* domains. Local links are those that are relative, or that go to the same domain as the current page.
	* Sub domains of the current page's domain can also optionally be considered local.
	*
	* @param {jQueryObject} [$container=$(document)] - A jQuery object to confine function's effect. If passed,
	*     only links containined within the tags represented by the jQuery object will be examined and
	*     potentially altered by the function.
	* @param {PlainObject} [opts] - A plain object containing configuration information.
	* @param {boolean} [opts.ignoreLocalLinks=true] - Whether or not to ignore *local* links.
	* @param {boolean} [opts.subDomainsLocal=true] - Whether or not subdomains of the current domain should
	*     be considered local.
	* @param {string[]} [opts.ignoreDomains=[]] - Links to domains in this array will be ignored.
	* @throws {TypeError} An error is thrown if the first argument is present, but not a jQuery object.
	* @returns {number} The number of links that were altered.
	* @example
	* // add rel=noopener to all links with a target of _blank that link to a URL outside the current
	* // site througout the entire document with the default settings
	* bartificer.linkToolkit.noopenerFix();
	*
	* // add rel=noopener to all links with a target of _blank that link to a URL outside the current
	* // site but only within a given container
	* bartificer.linkToolkit.noopenerFix($('#main_content'));
	*
	* // add re=noopener to all links with a target of _blank, regardless of what URL they link to throughout
	* // the entire document
	* bartificer.linkToolkit.noopenerFix(undefined, { ignoreLocalLinks: false });
	*/
	bartificer.linkToolkit.noopenerFix = function($container, opts){
		// process the arguments and set all missing values to their defaults
		if($container && !($container instanceof jQuery)){
			throw new TypeError('if present, the first argument must be a jQuery object');
		}
		if(!$container){
			$container = $(document);
		}
		if(opts && !$.isPlainObject(opts)){
			throw new TypeError('if present, the second argument must be a plain object');
		}
		opts = opts ? opts : {};
		opts.ignoreLocalLinks = typeof opts.ignoreLocalLinks === 'boolean' ? opts.ignoreLocalLinks : true;
		opts.subDomainsLocal = typeof opts.subDomainsLocal === 'boolean' ? opts.subDomainsLocal : true;
		opts.ignoreDomains = $.isArray(opts.ignoreDomains) ? opts.ignoreDomains : [];
		
		// find all links within the search area, and process each one
		var numLinksAltered = 0;
		$('a', $container).each(function(){
			var $a = $(this);
			
			// if the link has either of the classes that signify it should be ignored, skip it
			if($a.is('.bartificer-ignore, .bartificer-noopener-ignore')){
				_debug('skipping - has ignore class', $a);
				return;
			}
			
			// if the link does not have a target of _blank, skip it
			if($a.attr('target') !== '_blank'){
				_debug('skipping - does not have target of _blank', $a);
				return;
			}
			
			// build a URI object to represent the link's href
			var hrefObj = $a.uri();
			
			// check if the domain is to be skipped, and skip if so
			for(var i = 0; i < opts.ignoreDomains.length; i++){
				if(hrefObj.hostname() == opts.ignoreDomains[i]){
					_debug('skipping - matches ignore domain ' + opts.ignoreDomains[i], $a);
					return;
				}
			}
			
			// if local links are to be skipped, check if it is local, and if so, skip
			if(opts.ignoreLocalLinks && bartificer.linkToolkit.isLocalUrl($a.attr('href'), opts)){
				_debug('skipping - is local', $a);
				return;
			}
			
			// if we got here, we need to ensure the link has a rel of noopener
			if(_addRelNoopenerToLink($a)){
				numLinksAltered++;
			}
		});
		
		// return the number of links altered
		return numLinksAltered;
	};
	
	/**
	* Append an icon to the end of links with a `target` of `_blank`. A custom image can be specified, but by default
	* an icon from the Fugue Icons icon set by [Yusuke Kamiyamane](http://p.yusukekamiyamane.com), which is licensed
	* as (Creative Commons Attribution 3.0)[http://creativecommons.org/licenses/by/3.0/].
	*
	* The function will skip any links that have any of the CSS classes `bartificer-ignore`, or 
	* `bartificer-markExternal-ignore`
	*
	* The generated icons will have the CSS class `bartificer-externalLink`.
	*
	* @param {jQueryObject} [$container=$(document)] - Where to search for the links.
	* @param {PlainObject} [opts] - Specify configuration options.
	* @param {string} [opts.iconSrc] - The value to use for the icon image's `src` attribute. By default, a data attribute is used.
	* @param {boolean} [opts.iconExternal=true] - If `true`, the icon image will be added after the link (with jQuery's `.after()`
	*     function), otherwise, it will be added to the end of the link (with jQuery's `.append()` function).
	* @param {string} [opts.iconClasses=''] - Additional classes to add to the icon image as a singel space-separated string.
	* @param {string} [opts.altText='External Link Icon'] - The alternative text for the icons.
	* @param {string} [opts.titleText='Link Opens in New Window/Tab'] - The title text for the icons.
	* @returns {number} The number of icons injected.
	* @example
	* // add the default icon after all links within the enture document
	* bartificer.linkToolkit.markExternal();
	*
	* // add the default icon after all links with a target of _blank within a given container
	* bartificer.linkToolkit.markExternal($('#main_content'));
	*
	* // add a custom icon after all links with a target of _blank within a given container
	* bartificer.linkToolkit.markExternal(
	*   $('#main_content'),
	*   { iconSrc: 'externalIcon.png'}
	* );
	*/
	bartificer.linkToolkit.markExternal = function($container, opts){
		// process the arguments and set all missing values to their defaults
		if($container && !($container instanceof jQuery)){
			throw new TypeError('if present, the first argument must be a jQuery object');
		}
		if(!$container){
			$container = $(document);
		}
		if(opts && !$.isPlainObject(opts)){
			throw new TypeError('if present, the second argument must be a plain object');
		}
		opts = opts ? opts : {};
		opts.iconSrc = typeof opts.iconSrc === 'string' ? opts.iconSrc : _externalLinkIcon;
		opts.iconExternal = typeof opts.iconExternal === 'boolean' ? opts.iconExternal : true;
		opts.iconClasses = typeof opts.iconClasses === 'string' ? opts.iconClasses : '';
		opts.altText = typeof opts.altText === 'string' ? opts.altText : 'External Link Icon';
		opts.titleText = typeof opts.titleText === 'string' ? opts.titleText : 'Link Opens in New Window/Tab';
		
		// find all links within the search area, and process each one
		var numLinksAltered = 0;
		$('a', $container).each(function(){
			var $a = $(this);
			
			// if the link has either of the classes that signify it should be ignored, skip it
			if($a.is('.bartificer-ignore, .bartificer-markExternal-ignore')){
				_debug('skipping - has ignore class', $a);
				return;
			}
			
			// if the link does not have a target of _blank, skip it
			if($a.attr('target') !== '_blank'){
				_debug('skipping - does not have target of _blank', $a);
				return;
			}
			
			// if we got here, add the icon
			_addIconToLink($a, opts);
			numLinksAltered++;
			_debug('added icon', $a);
		});
		
		// return the number of links altered
		return numLinksAltered;
	};
	
	/**
	* Make links external by setting their `target` to `_blank`, adding `noopener` to their `rel`
	* attribute, and optionally appending an icon.
	*
	* Each element represented by `$links` will be checked to see if it is a link. By default, anything
	* that is not a link will be skipped, however, by setting the option `opts.searchContainers` to `true`,
	* all elements that are not links will be searched for containing links, and those links externalised.
	*
	* Any icon can be added, but by default, an icon from the *Fugue Icons* icon set by 
	* [Yusuke Kamiyamane](http://p.yusukekamiyamane.com), which is licensed as 
	* (Creative Commons Attribution 3.0)[http://creativecommons.org/licenses/by/3.0/] is used.
	*
	* When looking inside a container, the function will skip any links that have any of the CSS classes 
	* `bartificer-ignore`, `bartificer-externalize-ignore`, or `bartificer-externalise-ignore`. Links
	* specified directly will not be ignored based on their CSS classes.
	*
	* Altered links will have the CSS class `bartificer-externalLink` added, and if icons are added,
	* they will also have the CSS class `bartificer-externalLink`.
	*
	* Any links which already have a class of `bartificer-externalLink` will be skipped on the assumption
	* that they have already been externalised previously.
	* 
	* @param {jQueryObject} [$links=$()] - The links to alter. If a jQuery object is passed that does not
	*     represent any links, including a completely empty jQuery object, the function will silently do
	*     nothing.
	* @param {PlainObject} [opts] - Specify configuration options.
	* @param {boolean} [opts.searchContainers=false] - Whether or not to look inside non-link elements in
	*     `$links` for links.
	* @param {boolean} [opts.addIcon=true] - If `true`, the icon image will be added after all altered links.
	* @param {string} [opts.linkClasses=''] - Additional classes to add to all altered links.
	* @param {string} [opts.iconSrc] - The value to use for the icon image's `src` attribute. By default, a data attribute is used.
	* @param {boolean} [opts.iconExternal=true] - If `true`, the icon image will be added after the link (with jQuery's `.after()`
	*     function), otherwise, it will be added to the end of the link (with jQuery's `.append()` function).
	* @param {string} [opts.iconClasses=''] - Additional classes to add to the icon image as a singel space-separated string.
	* @param {string} [opts.altText='External Link Icon'] - The alternative text for the icons.
	* @param {string} [opts.titleText='Link Opens in New Window/Tab'] - The title text for the icons.
	* @returns {number} The number of links altered.
	* @throws {TypeError} An error is thrown if the first argument is not a jQuery object.
	* @throws {TypeError} An error is thrown if the second argument is present, but not a plain object.
	* @example
	* // externalise all links in the entire document using the default icon
	* bartificer.linkToolkit.externalise($('a'));
	*
	* // externalise all links within a given container using a custom icon
	* bartificer.linkToolkit.externalise(
	*   $('a', $('#main_content')),
	*   { iconSrc: 'externalIcon.png' }
	* );
	*/
	bartificer.linkToolkit.externalise = function($links, opts){
		// process the arguments and set all missing values to their defaults
		if(!($links instanceof jQuery)){
			throw new TypeError('the first argument must be a jQuery object');
		}
		if(opts && !$.isPlainObject(opts)){
			throw new TypeError('if present, the second argument must be a plain object');
		}
		opts = opts ? opts : {};
		opts.searchContainers = typeof opts.searchContainers === 'boolean' ? opts.searchContainers : false;
		opts.addIcon = typeof opts.addIcon === 'boolean' ? opts.addIcon : true;
		opts.linkClasses = typeof opts.linkClasses === 'string' ? opts.linkClasses : '';
		opts.iconSrc = typeof opts.iconSrc === 'string' ? opts.iconSrc : _externalLinkIcon;
		opts.iconExternal = typeof opts.iconExternal === 'boolean' ? opts.iconExternal : true;
		opts.iconClasses = typeof opts.iconClasses === 'string' ? opts.iconClasses : '';
		opts.altText = typeof opts.altText === 'string' ? opts.altText : 'External Link Icon';
		opts.titleText = typeof opts.titleText === 'string' ? opts.titleText : 'Link Opens in New Window/Tab';
		
		// figure out what links need to be processed
		var linksToProcess = [];
		$links.each(function(){
			var $e = $(this);
			if($e.is('a')){
				_debug('found directly specified link', $e);
				linksToProcess.push($e);
			}else{
				if(opts.searchContainers){
					$('a', $e).each(function(){
						var $ee = $(this);
						if($ee.is('.bartificer-ignore, .bartificer-externalize-ignore, .bartificer-externalise-ignore')){
							_debug('skipping link inside container because it has a special class', $ee, $e);
						}else{
							_debug('found link inside container', $ee, $e);
							linksToProcess.push($ee);
						}
					});
				}
			}
		});
		
		// process all the links
		linksToProcess.forEach(function($a){
			// make sure we are not re-processing an already externalised link
			if($a.is('.bartificer-externalLink')){
				_debug('skipping already externalised link', $a);
				return;
			}
			
			// set the target
			$a.attr('target', '_blank');
			
			// add noopener to rel
			_addRelNoopenerToLink($a);
			
			// if needed, inject the icon
			if(opts.addIcon){
				_addIconToLink($a, opts);
			}
			
			// add the needed link classes
			$a.addClass('bartificer-externalLink');
			if(opts.linkClasses.length){
				$a.addClass(opts.linkClasses);
			}
			
			_debug('externalised link', $a);
		});
		
		// return the number of links processed
		return linksToProcess.length;
	};
	
	/**
	* An alias for {@link bartificer.linkToolkit.externalise}.
	* @function
	* @see bartificer.linkToolkit.externalise
	*/
	bartificer.linkToolkit.externalize = bartificer.linkToolkit.externalise;
	
	/**
	* Scan through a document, or a subset of a document, and call `bartificer.linkToolkit.externalise()`
	* on each link that is not considered local to the site.
	*
	* @param {jQueryObject} [$container=$(document)] - Where to search for the links. The entire document is searched by default.
	* @param {PlainObject} [opts] - Specify configuration options.
	* @param {boolean} [opts.addIcon=true] - If `true`, the icon image will be added after all altered links.
	* @param {string} [opts.linkClasses=''] - Additional classes to add to all altered links.
	* @param {boolean} [opts.subDomainsLocal=true] - Whether or not subdomains of the current domain should
	*     be considered local.
	* @param {string[]} [opts.ignoreDomains=[]] - Links to domains in this array will be ignored.
	* @param {string} [opts.iconSrc] - The value to use for the icon image's `src` attribute. By default, a data attribute is used.
	* @param {boolean} [opts.iconExternal=true] - If `true`, the icon image will be added after the link (with jQuery's `.after()`
	*     function), otherwise, it will be added to the end of the link (with jQuery's `.append()` function).
	* @param {string} [opts.iconClasses=''] - Additional classes to add to the icon image as a singel space-separated string.
	* @param {string} [opts.altText='External Link Icon'] - The alternative text for the icons.
	* @param {string} [opts.titleText='Link Opens in New Window/Tab'] - The title text for the icons.
	* @returns {number} The number of links altered.
	* @throws {TypeError} An error is thrown if the first argument is present, but not a jQuery object.
	* @throws {TypeError} An error is thrown if the second argument is present, but not a plain object.
	* @throws {Error} Throws an exception if `URI.js` is not loaded.
	* @requires URI
	* @see bartificer.linkToolkit.externalise
	* @example
	* // externalise all links in the enture document that lead outside the site
	* bartificer.linkToolkit.autoExternalise();
	* 
	* // externalise all links within a given container, using a custom icon, and skipping links
	* // to a list of specified domains
	* bartificer.linkToolkit.autoExternalise(
	*   $('#main_content'),
	*   {
	*     iconSrc: 'externalIcon.png',
	*     ignoreDomains: ['bartbusschots.ie', 'www.bartbusschots.ie']
	*   }
	* );
	*/
	bartificer.linkToolkit.autoExternalise = function($container, opts){
		// make sure URI.js is loaded
		_assertURILoaded();
		
		// process the arguments and set all missing values to their defaults
		if($container && !($container instanceof jQuery)){
			throw new TypeError('if present, the first argument must be a jQuery object');
		}
		if(!$container){
			$container = $(document);
		}
		if(opts && !$.isPlainObject(opts)){
			throw new TypeError('if present, the second argument must be a plain object');
		}
		opts = opts ? opts : {};
		opts.addIcon = typeof opts.addIcon === 'boolean' ? opts.addIcon : true;
		opts.linkClasses = typeof opts.linkClasses === 'string' ? opts.linkClasses : '';
		opts.subDomainsLocal = typeof opts.subDomainsLocal === 'boolean' ? opts.subDomainsLocal : true;
		opts.ignoreDomains = $.isArray(opts.ignoreDomains) ? opts.ignoreDomains : [];
		opts.iconSrc = typeof opts.iconSrc === 'string' ? opts.iconSrc : _externalLinkIcon;
		opts.iconExternal = typeof opts.iconExternal === 'boolean' ? opts.iconExternal : true;
		opts.iconClasses = typeof opts.iconClasses === 'string' ? opts.iconClasses : '';
		opts.altText = typeof opts.altText === 'string' ? opts.altText : 'External Link Icon';
		opts.titleText = typeof opts.titleText === 'string' ? opts.titleText : 'Link Opens in New Window/Tab';
		
		// find all links within the search area, and process each one
		var numLinksAltered = 0;
		$('a', $container).each(function(){
			var $a = $(this);
			
			// if the link has any of the classes that signify it should be ignored, skip it
			if($a.is('.bartificer-ignore, .bartificer-externalize-ignore, .bartificer-externalise-ignore')){
				_debug('skipping - has ignore class', $a);
				return;
			}
			
			// skip local links
			if(bartificer.linkToolkit.isLocalUrl($a.attr('href'), opts)){
				_debug('skipping - local link', $a);
				return;
			}
			
			// if we got here, externalise the link
			bartificer.linkToolkit.externalise($a);
			
			// count the link
			numLinksAltered++;
			_debug('externalised', $a);
		});
		
		// return the number of links altered
		return numLinksAltered;
	};
	
	/**
	* An alias for {@link bartificer.linkToolkit.autoExternalise}.
	* @function
	* @see bartificer.linkToolkit.autoExternalise
	*/
	bartificer.linkToolkit.autoExternalize = bartificer.linkToolkit.autoExternalise;
})(bartificer, jQuery);