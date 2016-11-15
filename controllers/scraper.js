var request = require('request');
var cheerio = require('cheerio');
var urlP = require('url');

var reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

exports.scrape = function (url, req, res) {

    var links = [];
    
    request(url, function(error, status, html) {

        if(!error){

            var $ = cheerio.load(html);
            var loops = $('a').length;
            var counter = 0;

            $('a').filter(function(){

                var data = $(this);

                data.each(function(index, a){

                    var uStr = a.attribs.href;

                    if(reg.test(uStr)){

                        var domainP = urlP.parse(uStr).hostname;
              
			if(domainP != null){
                            links.push({domain: domainP, linkURL: uStr, links: [], linksCount: 0});
			}
                    }

                    counter++;

                    if(counter == loops){
                                         
                        res.json(links);

                    }

                }); // END each()

            }); // END filter()

        } else { // IF error

            res.json({error: JSON.stringify(error)});

        }
     
    }); // END request()

} // END scrape()
