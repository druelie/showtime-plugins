/*
 *  4tube - Showtime Plugin
 *
 *  Copyright (C) 2012-2014 druelie
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

    var service = plugin.createService(plugin.getDescriptor().id, plugin.getDescriptor().id + ":start", "video", true, logo);

    // Filter defaults
    service.sort     = "date";
    service.quality  = "hd";
    service.duration = ""; // Any
    service.time     = ""; // Any

    var blue = "6699CC", orange = "FFA500";

    function colorStr(str, color) {
        return '<font color="' + color + '"> (' + str + ')</font>';
    }

    function coloredStr(str, color) {
        return '<font color="' + color + '">' + str + '</font>';
    }

    function setPageHeader(page, title) {
        if (page.metadata) {
            page.metadata.title = title;
            page.metadata.logo = logo;
        }
        page.type = "directory";
        page.contents = "items";

        page.loading = false;
    }

    function setPageOptions(page) {
        var sortOptions = [
            ["date","Date",         (service.sort == "date")],
            ["duration","Duration", (service.sort == "duration")],
            ["rating","Rating",     (service.sort == "rating")],
            ["views","Views",       (service.sort == "views")]
        ];
        page.options.createMultiOpt("sort", "Sort by", sortOptions, function(v) {
            service.sort = v;
	});

        var qualityOptions = [
            ["","Any Quality", (service.quality == "")],
            ["hd","HD Only",   (service.quality == "hd")]
        ];
        page.options.createMultiOpt("quality", "Quality", qualityOptions, function(v) {
            service.quality = v;
        });

        var durationOptions = [
            ["","Any Duration",            (service.duration == "")],
            ["short","Short (0-5 min.)",   (service.duration == "short")],
            ["medium","Medium (5-20min.)", (service.duration == "medium")],
            ["long","Long (20+ min.)",     (service.duration == "long")]
        ];
        page.options.createMultiOpt("duration", "Duration", durationOptions, function(v) {
            service.duration = v;
        });


        var timeOptions = [
            ["","Any Time",         (service.time == "")],
            ["24h","Past 24 hours", (service.time == "24h")],
            ["week","Past Week",    (service.time == "week")],
            ["month","Past Month",  (service.time == "month")],
            ["year","Past Year",    (service.time == "year")]
        ];
        page.options.createMultiOpt("time", "Upload time", timeOptions, function(v) {
            service.time = v;
        });
    }


    // Play videolink
    plugin.addURI(plugin.getDescriptor().id + ":play:(.*):(.*)", function(page, url, title) {
        page.loading = true;
        var doc = showtime.httpReq(checkLink(url)).toString();
        // example: (800375623, 360, [1080,720,480,360,240])
        var re = /\((\d+), \d+, \[(\d+),/;
        var matchInfo = re.exec(doc);
        var mediaID  = matchInfo[1];
        var bestQual = matchInfo[2];
        var tempUrl  = "http://tkn.4tube.com/" + mediaID + "/desktop/" + bestQual;
        var doc = showtime.httpReq(tempUrl, {
            debug: true,
            method: "POST",
            headers: {
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Origin": "http://www.4tube.com",
                "Accept-Charset": null,
                "Content-Type": null
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
    plugin.addURI(plugin.getDescriptor().id + ":sorting:(.*):(.*)", function(page, title, url) {
        setPageHeader(page, plugin.getDescriptor().id + " - " + unescape(title));
        index(page, url);
    });

    // Enter category
    plugin.addURI(plugin.getDescriptor().id + ":category:(.*):(.*)", function(page, title, url) {
        setPageHeader(page, plugin.getDescriptor().id + " - " + unescape(title));
        index(page, url);
    });

    // Pornstar page
    plugin.addURI(plugin.getDescriptor().id + ":pornstar:(.*):(.*)", function(page, url, title) {
        setPageHeader(page, plugin.getDescriptor().id + " - " + unescape(title));
        index(page, url);
    });

    // Pornstars page
    plugin.addURI(plugin.getDescriptor().id + ":pornstars", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + " - Pornstars");
        indexPornstars(page);
    });

    // Main page
//    plugin.addURI(plugin.getDescriptor().id + ":movies", function(page) {
//        setPageHeader(page, plugin.getDescriptor().id + " - Sorted by ");
//        index(page, "/videos");
//    });


    // Categories page
    plugin.addURI(plugin.getDescriptor().id + ":categories", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + " - Categories", false);
        page.loading = true;
        var doc = showtime.httpReq(BASE_URL + "/tags").toString();
        page.loading = false;
        var mp = doc.match(/categories_page([\S\s]*?)footer/)[1];
        //                            1-link             2-title                              3-numofvideos                          4-icon
        var re = /"thumb-link" href="([\S\s]*?)" title="([\S\s]*?)">[\S\s]*?icon-video"><\/i>([\S\s]*?)<[\S\s]*?<img data-original="([\S\s]*?)"/g;
        var match = re.exec(mp);
        while (match) {
            page.appendItem(plugin.getDescriptor().id + ":sorting:" + escape(match[2]) + ":" + escape(match[1]), "video", {
                title: new showtime.RichText(match[2] + colorStr(match[3].replace(",","."), blue)),
                icon: match[4]
            });
            var match = re.exec(mp);
        }
    });

    function checkLink(link) {
        if (link.substr(0, 4) != "http") link = BASE_URL + link;
        link = unescape(link);
        link = link.replace(/&amp;/g,"&");
        showtime.trace("Checked URL: "+link,"AC");
        return link;
    }

    function indexPornstars(page) {
        page.loading = true;
        page.entries = 0;
        var tryToSearch = true, url = "/pornstars";

        function scraper(doc) {
        //                                1-link             2-title                             3-videos                                4-twitter                             5-icon,
            var re = /"thumb-link" href="([\S\s]*?)" title="([\S\s]*?)"[\S\s]*?icon-video"><\/i>([\S\s]*?)<[\S\s]*?"icon-twitter"><span>([\S\s]*?)<[\S\s]*?img data-original="([\S\s]*?)"/g;
            var match = re.exec(doc);

			while (match) {
				page.appendItem(plugin.getDescriptor().id + ":pornstar:" + escape(match[1]) + ":" + escape(match[2]), "video", {
					title: new showtime.RichText(match[2] + colorStr(match[3], orange)),
					icon: match[5],
					description: new showtime.RichText(coloredStr("Twitter: ", orange) + match[4])
				});
				page.entries++;
				match = re.exec(doc);
			}
        }

        function loader() {
            if (!tryToSearch) return false;
            page.loading = true;

            url = checkLink(url);
            var probe = showtime.probe(url);
            
            if (probe.result != 0) {
				page.appendItem("", "separator", {
					title: "- No Results -"
				});
				page.appendPassiveItem("file", "", {
					title: "Change filter settings and reload page"
				});
                page.entries++;
				page.loading = false;
				return tryToSearch = false;
			}
			else
			{
				var doc = showtime.httpReq(url).toString();
				var pageNumber = doc.match(/currentPage = '(.*?)';/)[1];
				var pageTitle = "- Page " + pageNumber + " -";
				page.loading = false;
				page.appendItem("", "separator", {
					title: pageTitle
				});
				scraper(doc.match(/pornstars_page([\S\s]*?)"pagination"/)[1]);
				var next = doc.match(/<li><a href="(http.*?)" id="next" /);
				if (!next) return tryToSearch = false;
				url = next[1];
				return true;
			}
        }
        loader();
        page.paginator = loader;
    }

    function index(page, url) {
        setPageOptions(page);
        // add filters
        url += "?sort=" + service.sort;
        if (service.duration != "") url += "&duration=" + service.duration;
        if (service.time     != "") url += "&time="     + service.time;
        if (service.quality  != "") url += "&quality="  + service.quality;

        page.loading = true;
        page.entries = 0;
        var tryToSearch = true;

        function scraper(doc) {
            //                                        1-link                      2-title                               3-icon      4-HD ?                           5-length                                          6-views                          7-uploaded
            var re = />Watch Later<\/button><a href="([\S\s]*?)" [\S\s]*? title="([\S\s]*?)" [\S\s]*?<img data-master="([\S\s]*?)" ([\S\s]*?)"icon icon-timer"><\/i>([\S\s]*?)<\/li><li><i class="icon icon-eye"><\/i>([\S\s]*?)<[\S\s]*?icon-up"><\/i>([\S\s]*?)</g;
            var match = re.exec(doc);
			while (match) {
				var hdString = "";
				if (match[4].match(/<li>HD<\/li>/)) hdString = "[HD]";
				page.appendItem(plugin.getDescriptor().id + ":play:" + escape(match[1]) + ":" + escape(match[2]), "video", {
					title: new showtime.RichText(coloredStr(hdString, orange) + match[2] + colorStr(match[5], orange)),
					icon: match[3],
					description: new showtime.RichText(coloredStr("Views: ", orange) + match[6] + " - " + coloredStr("Uploaded: ", orange) + match[7]),
					genre: "Adult",
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
            url = checkLink(url);
            var probe = showtime.probe(url);
            
            if (probe.result != 0) {
				var pageTitle = "- No Results - Filter: " + service.sort + " " + service.quality + " " + service.duration + " " + service.time;
				page.appendItem("", "separator", {
					title: pageTitle
				});
				page.appendPassiveItem("file", "", {
					title: "Change filter settings and reload page"
				});
                page.entries++;
				page.loading = false;
				return tryToSearch = false;
			}
			else
			{
				var doc = showtime.httpReq(url).toString();
				var pageNumber = doc.match(/currentPage = '(.*?)';/)[1];
				var pageTitle = "- Page " + pageNumber + " -  Filter: " + service.sort + " " + service.quality + " " + service.duration + " " + service.time;
				page.loading = false;
				page.appendItem("", "separator", {
					title: pageTitle
				});
				scraper(doc.match(/data-video-uuid([\S\s]*?)"pagination"/)[1]);
				var next = doc.match(/<li><a href="(http.*?)" id="next" /);
				if (!next) return tryToSearch = false;
				url = next[1];
				return true;
			}
        }
        loader();
        page.paginator = loader;
    }


    // Start page
    plugin.addURI(plugin.getDescriptor().id + ":start", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + " - Home");
        page.appendItem(plugin.getDescriptor().id + ":categories", "directory", {
            title: "Categories"
        });
        page.appendItem(plugin.getDescriptor().id + ":pornstars", "directory", {
            title: "Pornstars"
        });
        index(page, "/videos");
    });

    plugin.addSearcher(plugin.getDescriptor().id, logo, function(page, query) {
        index(page, "/search?q=" + query.replace(/\s/g, "\+"));
    });
})(this);
