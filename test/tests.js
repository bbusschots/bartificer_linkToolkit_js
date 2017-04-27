//
// === Pre-flight checks ======================================================
//

// Warn if we're not being run on localhost
QUnit.begin(function(){
    var pageUrlObj = new URI();
    if(pageUrlObj.hostname() !== 'localhost'){
        window.alert("WARNING - this test suite is designed to be run from the domain localhost, but it is currently running from the domain '" + pageUrlObj.hostname() + "'\nResults will not be accurate.");
    }
});

//
// === Tests for bartificer.linkToolkit.isLocalUrl() ==========================
//
QUnit.module('isLocalUrl()', {}, function(){
    // create a short alias for the function being tested
    var isLocalUrl = bartificer.linkToolkit.isLocalUrl;
    
    QUnit.test('default behaviour', function(a){
        a.equal(isLocalUrl(''), true, 'empty string is a relative URL');
        a.equal(isLocalUrl(42), true, 'a number is considered a relative URL');
        a.equal(isLocalUrl('#frag'), true, 'A URL with just a fragment is considered local');
        a.equal(isLocalUrl('?a=b'), true, 'A URL with just a query string is considered local');
        a.equal(isLocalUrl('a.html'), true, 'A URL with just a file name is considered local');
        a.equal(isLocalUrl('/'), true, "The URL '/' is considered local");
        a.equal(isLocalUrl('/a.html'), true, 'A URL beginging with / is considered local');
        a.equal(isLocalUrl('./a.html'), true, 'A URL beginging with ./ is considered local');
        a.equal(isLocalUrl('../a.html'), true, 'A URL beginging with ../ is considered local');
        a.equal(isLocalUrl('http://localhost/'), true, 'The base localhost URL is considered local');
        a.equal(isLocalUrl('http://localhost/a.html'), true, 'An absolulte URL on localhost is considered local');
        a.equal(isLocalUrl('http://www.localhost/a.html'), true, 'An absolute URL on a sub-domain of localhost is considered local');
        a.equal(isLocalUrl('ftp://localhost/'), true, 'An absolute FTP URL on localhost is considered local');
        a.equal(isLocalUrl('http://localhost:8080/'), true, 'A absolute URL to another port on localhost is considered local');
        a.equal(isLocalUrl('http://bartb.ie/'), false, 'An absolute URL to a domain that is not localhost nor a subdomain of localhost is not considered local');
        a.equal(isLocalUrl(false), false, 'a boolean is not considered a local URL');
        a.equal(isLocalUrl([1, 2]), false, 'an Array is not considered a local URL');
        a.equal(isLocalUrl({boogers: 'snot'}), false, 'a plain object is not considered a local URL');
        a.equal(isLocalUrl(function(){}), false, 'a callback is not considered a local URL');
    });
    
    QUnit.test('the subDomainsLocal option', function(a){
        a.equal(isLocalUrl('http://www.localhost/a.html', {subDomainsLocal: true}), true, 'a subdomain of localhost is considered local when subDomainsLocal is set to true');
        a.equal(isLocalUrl('http://www.localhost/a.html', {subDomainsLocal: false}), false, 'a subdomain of localhost is considered local when subDomainsLocal is set to false');
    });
    
    QUnit.test('the localDomains option', function(a){
        a.equal(
            isLocalUrl('http://bartb.ie/a.html', {localDomains: ['bartb.ie']}),
            true,
            'URL on single listed local domain is considered local'
        );
        a.equal(
            isLocalUrl('http://bartbusschots.ie/?foo=bar', {localDomains: ['bartb.ie', 'bartbusschots.ie']}),
            true,
            'URL on one of multiple listed local domain is considered local'
        );
        a.equal(
            isLocalUrl('http://podfeet.com', {localDomains: ['bartb.ie']}),
            false,
            'non-localhost domain not listed in localDomains list is not considered local'
        );
        a.equal(isLocalUrl(
            'http://www.bartb.ie/', {localDomains: ['bartb.ie']}),
            false,
            'subdomain of a listed local domain is not considered local'
        );
    });
});

//
// === Tests for bartificer.linkToolkit.noopenerFix() =========================
//
QUnit.module('noopenerFix()', {}, function(){
    QUnit.test('default options', function(a){
        // call the function on the fixture with the default options
        bartificer.linkToolkit.noopenerFix($('#qunit-fixture'));
        
        // make sure the links without a target were ignored as expected
        a.equal(
            $('#rl_nt_nr').attr('rel'),
            undefined,
            'no rel added to a relative link without a target'
        );
        a.equal(
            $('#al_nt_nr').attr('rel'),
            undefined,
            'no rel added to an absolute link to localhost without a target'
        );
        a.equal(
            $('#as_nt_nr').attr('rel'),
            undefined,
            'no rel added to an absolute link to a subdomain of localhost without a target'
        );
        a.equal(
            $('#ab_nt_nr').attr('rel'),
            undefined,
            'no rel added to an absolute link to an external domain without a target'
        );
        
        // make sure local links with a target were also ignored
        a.equal(
            $('#rl_tb_nr').attr('rel'),
            undefined,
            'no rel added to a relative link with a target'
        );
        a.equal(
            $('#al_tb_nr').attr('rel'),
            undefined,
            'no rel added to an absolute link to localhost with a target'
        );
        a.equal(
            $('#as_tb_nr').attr('rel'),
            undefined,
            'no rel added to an absolute link to a subdomain of localhost with a target'
        );
        
        // make sure external links with a target but with the ignore classes are also ignored
        a.equal(
            $('#ap_tb_nr_ib').attr('rel'),
            undefined,
            'no rel added to an absolute link to an external domain with a target but with the class bartificer-ignore'
        );
        a.equal(
            $('#ap_tb_nr_in').attr('rel'),
            undefined,
            'no rel added to an absolute link to an external domain with a target but with the class bartificer-noopener-ignore'
        );
        
        // make sure a rel of nooperer was added to an external link without an existing rel
        a.equal(
            $('#ap_tb_nr').attr('rel'),
            'noopener',
            'rel set to noopener on an absolute link to an external domain with a target'
        );
        
        // make sure the rel was not doubled up on an external link with an existing rel of noopener
        a.equal(
            $('#ap_tb_ro').attr('rel'),
            'noopener',
            'rel left unchanged on an absolute link to an external domain with a target that already had rel="noopener"'
        );
        
        // make sure the rel was not doubled up on an external link with an existing rel of noopener and nofollow
        a.equal(
            $('#ap_tb_r2').attr('rel'),
            'noopener nofollow',
            'rel left unchanged on an absolute link to an external domain with a target that already had rel="noopener nofollow"'
        );
        
        // make sure the rel was appended to when it existed but was not noopener
        a.equal(
            $('#ap_tb_rf').attr('rel'),
            'nofollow noopener',
            'rel correctly appended on an absolute link to an external domain with a target that already had rel="nofollow"'
        );
    });
    
    QUnit.test('option ignoreLocalLinks=false', function(a){
        // call the function on the fixture with the ignoreLocalLinks option set to false
        bartificer.linkToolkit.noopenerFix($('#qunit-fixture'), {ignoreLocalLinks: false});
        
        // make sure the local links with a target had their rel set
        a.equal(
            $('#rl_tb_nr').attr('rel'),
            'noopener',
            'rel set to noopener on relative link with a target'
        );
        a.equal(
            $('#al_tb_nr').attr('rel'),
            'noopener',
            'rel set to noopener on absolute link to localhost with a target'
        );
    });
    
    QUnit.test('options ignoreLocalLinks=true & subDomainsLocal=true', function(a){
        // call the function on the fixture with the options to be tested
        bartificer.linkToolkit.noopenerFix(
            $('#qunit-fixture'),
            {
                ignoreLocalLinks: true,
                subDomainsLocal: true
            }
        );
        
        // make sure the link to a subdomain of localhost with a target did not get their rel set
        a.equal(
            $('#as_tb_nr').attr('rel'),
            undefined,
            'rel not set on absolute link to a subdomain of localhost with a target'
        );
    });
    
    QUnit.test('option ignoreDomains', function(a){
        // call the function on the fixture with the ignoreDomains option
        bartificer.linkToolkit.noopenerFix(
            $('#qunit-fixture'),
            { ignoreDomains: ['bartb.ie', 'podfeet.com'] }
        );
        
        // make sure links to the ignored domains did not get their rel set
        a.equal(
            $('#ab_tb_nr').attr('rel'),
            undefined,
            'rel not set on absolute link to bartb.ie with a target'
        );
        a.equal(
            $('#ap_tb_nr').attr('rel'),
            undefined,
            'rel not set on absolute link to podfeet.com with a target'
        );
    });
});

//
// === Tests for bartificer.linkToolkit.markExternal() ========================
//
QUnit.module('markExternal()', {}, function(){
    QUnit.test('default options', function(a){
        // call the function on the fixture with the default options
        bartificer.linkToolkit.markExternal($('#qunit-fixture'));
        
        // make sure there was an icon added after each of the links with a target
        // of _blank that does not have one of the relevant ignore classes
        var ids_must_have_icon = ['rl_tb_nr', 'al_tb_nr', 'as_tb_nr', 'ab_tb_nr', 'ap_tb_nr', 'ap_tb_rf', 'ap_tb_ro', 'ap_tb_r2', 'ap_tb_nr_in'];
        ids_must_have_icon.forEach(function(aId){
            var $a = $('#' + aId); // the link
            var $li = $a.parent(); // the list item containing the link
            a.equal(
                $('a + img', $li).length, // the number of images after links in the list item
                1, // one image should have been added after the link
                'an image was added after the link: ' + $a.text()
            );
        });
        
        // make sure no icon was added after any of the links with a target of _blank
        var ids_no_target = ['rl_nt_nr', 'al_nt_nr', 'as_nt_nr', 'ab_nt_nr', 'ap_nt_nr'];
        ids_no_target.forEach(function(aId){
            var $a = $('#' + aId); // the link
            var $li = $a.parent(); // the list item containing the link
            a.equal(
                $('img', $li).length, // the number of images in the list item
                0, // there should be no images in the list item
                'no image was added after the link: ' + $a.text()
            );
        });
        
        // make sure the links with the appropriate ignore classes were ignored
        a.equal(
            $('img', $('#ap_tb_nr_ib').parent()).length,
            0,
            'no icon added after link with class "bartificer-ignore"'
        );
        a.equal(
            $('img', $('#ap_tb_nr_im').parent()).length,
            0,
            'no icon added after link with class "bartificer-markExternal-ignore"'
        );
        
        // make sure the icons have the expected attributes
        var $sampleIcon = $('li a + img', $('#qunit-fixture')).first();
        a.ok(
            $sampleIcon.is('.bartificer-externalLink'),
            'generated icons have the class "bartificer-externalLink"'
        );
        a.equal(
            $sampleIcon.attr('alt'),
            'External Link Icon',
            'generated icons have the expected alt text'
        );
        a.equal(
            $sampleIcon.attr('title'),
            'Link Opens in New Window/Tab',
            'generated icons have the expected title'
        );
    });
    
    QUnit.test('option iconSrc', function(a){
        // a custom image URL to use for the icons
        var customIconSrc = 'externalIcon.png'; // does not need to exist for the test to work
        
        // call the function on the fixture with the relevant option set
        bartificer.linkToolkit.markExternal(
            $('#qunit-fixture'),
            { iconSrc: customIconSrc }
        );
        
        // make sure the icons have the custom source URL
        a.equal(
            $('li a + img', $('#qunit-fixture')).first().attr('src'),
            customIconSrc,
            'generated icons have the expected custom source URL'
        );
    });
    
    QUnit.test('option iconExternal=false', function(a){
        // call the function on the fixture with the relevant option set
        bartificer.linkToolkit.markExternal(
            $('#qunit-fixture'),
            { iconExternal: false }
        );
        
        // make sure an icon was added inside a sample link
        a.equal(
            $('img', $('#rl_tb_nr')).length, // the number of images inside the link
            1, // there should be exactly one image in the link
            'icon added inside the link'
        );
        
        // make sure no icon was added after the link
        a.equal(
            $('a + img', $('#rl_tb_nr').parent()).length, // the number of images after links in the list item
            0, // there should be no images after the link
            'no icon added after the link'
        );
    });
    
    QUnit.test('option iconClasses', function(a){
        // the classes to add
        var extraIconClasses = ['testc1', 'testc2', 'testc3'];
        
        // call the function on the fixture with the relevant option set
        bartificer.linkToolkit.markExternal(
            $('#qunit-fixture'),
            { iconClasses: extraIconClasses.join(' ') }
        );
        
        // make sure each of the classes was added
        var $sampleIcon = $('li a + img', $('#qunit-fixture')).first();
        extraIconClasses.forEach(function(c){
            a.ok(
                $sampleIcon.is('.' + c),
                'Genereated icons have the additonal class: ' + c
            );
        });
        
        // make sure the default class was also added
        a.ok(
            $sampleIcon.is('.bartificer-externalLink'),
            'standard class added as well as extra classes'
        );
    });
    
    QUnit.test('option altText', function(a){
        var customAltText = 'dummy alt text';
        
        // call the function on the fixture with the relevant option set
        bartificer.linkToolkit.markExternal(
            $('#qunit-fixture'),
            { altText: customAltText }
        );
        
        // make sure the icons have the custom alt text
        a.equal(
            $('li a + img', $('#qunit-fixture')).first().attr('alt'),
            customAltText,
            'generated icons have the expected alt text'
        );
    });
    
    QUnit.test('option titleText', function(a){
        var customTitleText = 'dummy title text';
        
        // call the function on the fixture with the relevant option set
        bartificer.linkToolkit.markExternal(
            $('#qunit-fixture'),
            { titleText: customTitleText }
        );
        
        // make sure the icons have the custom title
        a.equal(
            $('li a + img', $('#qunit-fixture')).first().attr('title'),
            customTitleText,
            'generated icons have the expected title text'
        );
    });
});