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
});