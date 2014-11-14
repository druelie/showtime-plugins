/*
 *  4tube - Showtime Plugin
 *
 *  Copyright (C) 2012-2014 AC
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function(plugin) {
    var BASE_URL = "http://www.4tube.com";
    var HD_URL = BASE_URL + "/videos?sort=date&quality=hd";
    var logo = plugin.path + "4tube.png";
    var HDOnly = true;
    
    
    function setPageHeader(page, title) {
        if (page.metadata) {
            page.metadata.title = title;
            page.metadata.logo = logo;
        }
        page.type = "directory";
        page.contents = "items";
        page.options.createBool("hdonly", "Show HD only", HDOnly, function(v) {
            HDOnly = v;
        });

        page.loading = false;
    }

    var blue = "6699CC", orange = "FFA500";

    function colorStr(str, color) {
        return '<font color="' + color + '"> (' + str + ')</font>';
    }

    function coloredStr(str, color) {
        return '<font color="' + color + '">' + str + '</font>';
    }

    plugin.createService(plugin.getDescriptor().id, plugin.getDescriptor().id + ":start", "video", true, logo);

    function indexPornstars(page) {
        page.loading = true;
        page.entries = 0;
        var tryToSearch = true, url = '/pornstars/'

        function scraper(doc) {
        // 1-link, 2-icon, 3-title, 4-videos, 5-views
            var re = /<li>[\S\s]*?<a href="([\S\s]*?)">[\S\s]*?src="([\S\s]*?)" title="([\S\s]*?)"[\S\s]*?<p>Videos: ([\S\s]*?) \&nbsp; Views: ([\S\s]*?)<\/p>/g;
            var match = re.exec(doc);
            while (match) {
                page.appendItem(plugin.getDescriptor().id + ":pornstar:" + escape(match[1]) + ":" + escape(match[3]), "video", {
                    title: new showtime.RichText(match[3] + colorStr(match[4], orange)),
                    icon: match[2],
                    description: new showtime.RichText(coloredStr('Views: ', orange) + match[5])
                });
                page.entries++;
                match = re.exec(doc);
            }
        }

        function loader() {
            if (!tryToSearch) return false;
            page.loading = true;
            var doc = showtime.httpReq(checkLink(url)).toString();
            page.loading = false;
            var mp = doc.match(/<h2>Featured Pornstars<\/h2>([\S\s]*?)<\/ul>/);
            if (mp) {
                page.appendItem("", "separator", {
                    title: 'Featured Pornstars'
                });
                scraper(mp[1]);
                page.appendItem("", "separator", {
                    title: doc.match(/<br class="clear" \/>[\S\s]*?<h2>([\S\s]*?)<\/h2>/)[1]
                });
            }
            scraper(doc.substr(doc.lastIndexOf('<div class="seperator">')));
            var next = doc.match(/<a class="next" href="([\S\s]*?)">Next<\/a>/);
            if (!next) return tryToSearch = false;
            url = next[1];
            return true;
        }
        loader();
        page.paginator = loader;
    }

    // Play videolink
    plugin.addURI(plugin.getDescriptor().id + ":play:(.*):(.*)", function(page, url, title) {
        page.loading = true;
        var doc = showtime.httpReq(unescape(url)).toString();
        // example: (800375623, 360, [1080,720,480,360,240])
        var re = /\((\d+), \d+, \[(\d+),/;
        var matchInfo = re.exec(doc);
        var mediaID  = matchInfo[1];
        var bestQual = matchInfo[2];
        var tempUrl  = 'http://tkn.4tube.com/' + mediaID + '/desktop/' + bestQual;
        // add httpReq here
        var doc = showtime.httpReq(tempUrl, {
            debug: true,
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Origin': 'http://www.4tube.com',
                'Accept-Charset': null,
                'Content-Type': null
            }
        }).toString();
        showtime.trace("Videoserver response: "+doc,"AC");
        var re = /"status":"success","token":"(http[^<>"]*?)"/;
        var videoUrl = re.exec(doc)[1];
        showtime.trace("VideoURL: "+videoUrl,"AC");
        if (videoUrl != null)
        {
            videoUrl = videoUrl + "&start=0";
        }
        page.loading = false;
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            title: unescape(title),
            canonicalUrl: plugin.getDescriptor().id + ":play:" + url + ":" + title,
            sources: [{
                url: videoUrl
            }]
        });
    });

    // Sorting selected category
    plugin.addURI(plugin.getDescriptor().id + ":sorting:(.*):(.*):(.*)", function(page, title, url, sorting) {
        setPageHeader(page, plugin.getDescriptor().id + ' - ' + unescape(title));
        page.options.createBool("hdonly", "Show HD only", HDOnly, function(v) {
            HDOnly = v;
        });
        
//        page.appendItem(plugin.getDescriptor().id + ':category:' + title + ":" + url + ":date", 'directory', {
//            title: "Sorted by date",
//            icon: logo
//        });
        page.appendItem(plugin.getDescriptor().id + ':category:' + title + ":" + url + ':duration', 'directory', {
            title: "Sorted by duration",
            icon: logo
        });
        page.appendItem(plugin.getDescriptor().id + ':category:' + title + ":" + url + ':rating', 'directory', {
            title: "Sorted by rating",
            icon: logo
        });
        page.appendItem(plugin.getDescriptor().id + ':category:' + title + ":" + url + ':views', 'directory', {
            title: "Sorted by views",
            icon: logo
        });
        index(page, unescape(url) + '?sort=' + sorting); // default
    });

    // Enter category
    plugin.addURI(plugin.getDescriptor().id + ":category:(.*):(.*):(.*)", function(page, title, url, sorting) {
        setPageHeader(page, plugin.getDescriptor().id + ' - ' + unescape(title) + ' - Sorted by ' + sorting );
        index(page, unescape(url) + '?sort=' + sorting);
    });

    // Pornstar page
    plugin.addURI(plugin.getDescriptor().id + ":pornstar:(.*):(.*)", function(page, url, title) {
        setPageHeader(page, plugin.getDescriptor().id + ' - ' + unescape(title));
        index(page, unescape(url));
    });

    // Pornstars page
    plugin.addURI(plugin.getDescriptor().id + ":pornstars", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + ' - Pornstars');
        indexPornstars(page);
    });

    // Main page
    plugin.addURI(plugin.getDescriptor().id + ":movies:(.*)", function(page, sorted) {
        setPageHeader(page, plugin.getDescriptor().id + ' - Sorted by ' + sorted);
        index(page, '/videos?sort=' + sorted);
    });


    // Categories page
    plugin.addURI(plugin.getDescriptor().id + ":categories", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + ' - Categories');
        page.loading = true;
        var doc = showtime.httpReq(BASE_URL + "/tags").toString();
        page.loading = false;
        var mp = doc.match(/categories_page([\S\s]*?)footer/)[1];
    //                            1-link             2-title                              3-numofvideos                          4-icon
        var re = /"thumb-link" href="([\S\s]*?)" title="([\S\s]*?)">[\S\s]*?icon-video"><\/i>([\S\s]*?)<[\S\s]*?<img data-original="([\S\s]*?)"/g;
        var match = re.exec(mp);
        while (match) {
            page.appendItem(plugin.getDescriptor().id + ":sorting:" + escape(match[2]) + ":" + escape(match[1]) + ":date", "video", {
                title: new showtime.RichText(match[2] + colorStr(match[3].replace(',','.'), blue)),
                icon: match[4]
            });
            var match = re.exec(mp);
        }
    });

    function checkLink(link) {
        if (link.substr(0, 4) != 'http') return BASE_URL + link;
        return link;
    }

    function index(page, url) {
        if ((HDOnly == true) && !url.match(/&quality=hd/))
            url = url + '&quality=hd';
        showtime.trace("Index URL: " + url, "AC");
        page.loading = true;
        page.entries = 0;
        var tryToSearch = true;

        function scraper(doc) {
            //                                        1-link                      2-title                               3-icon      4-HD ?                           5-length                                          6-views                          7-uploaded
            var re = />Watch Later<\/button><a href="([\S\s]*?)" [\S\s]*? title="([\S\s]*?)" [\S\s]*?<img data-master="([\S\s]*?)" ([\S\s]*?)"icon icon-timer"><\/i>([\S\s]*?)<\/li><li><i class="icon icon-eye"><\/i>([\S\s]*?)<[\S\s]*?icon-up"><\/i>([\S\s]*?)</g;
            var match = re.exec(doc);
            while (match) {
                var hdString = '';
                if (match[4].match(/<li>HD<\/li>/)) hdString = '[HD]';
                page.appendItem(plugin.getDescriptor().id + ":play:" + escape(match[1]) + ":" + escape(match[2]), "video", {
                    title: new showtime.RichText(coloredStr(hdString, orange) + match[2] + colorStr(match[5], orange)),
                    icon: match[3],
                    description: new showtime.RichText(coloredStr('Views: ', orange) + match[6] + ' - ' + coloredStr('Uploaded: ', orange) + match[7]),
                    genre: 'Adult',
                    duration: match[5]
                    // rating: match[6] * 10
                });
                page.entries++;
                match = re.exec(doc);
            }
        }

        function loader() {
            if (!tryToSearch) return false;
            page.loading = true;
            var doc = showtime.httpReq(checkLink(url)).toString();
            var fullTitle = '- Page ' + doc.match(/currentPage = '(.*?)';/)[1] + ' -';
            page.loading = false;
            page.appendItem("", "separator", {
                title: fullTitle
            });
            scraper(doc.match(/data-video-uuid([\S\s]*?)"pagination"/)[1]);
            var next = doc.match(/<li><a href="(.*?)" id="next" /);
            if (!next) return tryToSearch = false;
            url = next[1];
            return true;
        }
        loader();
        page.paginator = loader;
    }

   
    // Start page
    plugin.addURI(plugin.getDescriptor().id + ":start", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + ' - Home');
        page.appendItem(plugin.getDescriptor().id + ':movies:popularity', 'directory', {
            title: 'Sorted by popularity'
        });
//        page.appendItem(plugin.getDescriptor().id + ':movies:date', 'directory', {
//            title: 'Videos sorted by date'
//        });
        page.appendItem(plugin.getDescriptor().id + ':movies:duration', 'directory', {
            title: 'Sorted by duration'
        });
        page.appendItem(plugin.getDescriptor().id + ':movies:rating', 'directory', {
            title: 'Sorted by rating'
        });
        page.appendItem(plugin.getDescriptor().id + ':movies:views', 'directory', {
            title: 'Sorted by views'
        });
        page.appendItem(plugin.getDescriptor().id + ':categories', 'directory', {
            title: 'Categories'
        });
 //       page.appendItem(plugin.getDescriptor().id + ':pornstars', 'directory', {
 //           title: 'Pornstars'
 //       });
        index(page, BASE_URL + '/videos?sort=date');
    });

    plugin.addSearcher(plugin.getDescriptor().id, logo, function(page, query) {
        index(page, BASE_URL + "/search?q=" + query.replace(/\s/g, '\+'));
    });
})(this);
