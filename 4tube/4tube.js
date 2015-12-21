/*
 *  4tube - Showtime Plugin
 *
 *  Copyright (C) 2014 druelie
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
    var logo = plugin.path + "4tube.png";

    var service  = plugin.createService(plugin.getDescriptor().id, plugin.getDescriptor().id + ":start", "video", true, logo);
    var settings = plugin.createSettings(plugin.getDescriptor().title, logo, plugin.getDescriptor().synopsis);

    settings.createDivider('Video Settings');
    var maxResFilter = [
        ['1080', '1080p', true], ['720', '720p'], ['480', '480p'], ['360', '360p'], ['240', '240p']
    ];
    settings.createMultiOpt("maxVideoRes", "Maximum video playback resolution", maxResFilter, function(v){
        service.maxVideoRes = v;
    });

    // Filter defaults
    service.sort       = "date";
    service.quality    = "hd";
    service.duration   = ""; // Any
    service.time       = ""; // Any
    
    service.catSort    = ""; // Name
    service.pStarsSort = ""; // Popularity
    service.pStarsName = ""; // Any
    service.channelsSort = "";
    service.channelsName = "";

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
    
	function setCatPageOptions(page) {
		var sortOptions = [
			["","Name",                (service.catSort == "")],
			["qty","Number of videos", (service.catSort == "qty")],
			["date","Date added",      (service.catSort == "date")]
		];
		page.options.createMultiOpt("catSort", "Sort by", sortOptions, function(v) {
			service.catSort = v;
		});
	}

    function setPStarsPageOptions(page) {
        var sortOptions = [
            ["","Popularity",               (service.pStarsSort == "")],
            ["twitter","Twitter followers", (service.pStarsSort == "twitter")],
            ["videos","Number of videos",   (service.pStarsSort == "videos")],
            ["name","Name",                 (service.pStarsSort == "name")],
            ["date","Date added",           (service.pStarsSort == "date")],
            ["likes","Likes",               (service.pStarsSort == "likes")],
            ["subscribers","Subscribers",   (service.pStarsSort == "subscribers")]
        ];
        page.options.createMultiOpt("pStarsSort", "Sort by", sortOptions, function(v) {
            service.pStarsSort = v;
		});

        var sortOptions = [
            ["","Any Name", (service.pStarsName == "")],
            ["a","A", (service.pStarsName == "a")],
            ["b","B", (service.pStarsName == "b")],
            ["c","C", (service.pStarsName == "c")],
            ["d","D", (service.pStarsName == "d")],
            ["e","E", (service.pStarsName == "e")],
            ["f","F", (service.pStarsName == "f")],
            ["g","G", (service.pStarsName == "g")],
            ["h","H", (service.pStarsName == "h")],
            ["i","I", (service.pStarsName == "i")],
            ["j","J", (service.pStarsName == "j")],
            ["k","K", (service.pStarsName == "k")],
            ["l","L", (service.pStarsName == "l")],
            ["m","M", (service.pStarsName == "m")],
            ["n","N", (service.pStarsName == "n")],
            ["o","O", (service.pStarsName == "o")],
            ["p","P", (service.pStarsName == "p")],
            ["r","R", (service.pStarsName == "r")],
            ["s","S", (service.pStarsName == "s")],
            ["t","T", (service.pStarsName == "t")],
            ["u","U", (service.pStarsName == "u")],
            ["v","V", (service.pStarsName == "v")],
            ["w","W", (service.pStarsName == "w")],
            ["x","X", (service.pStarsName == "x")],
            ["y","Y", (service.pStarsName == "y")],
            ["z","Z", (service.pStarsName == "z")]
        ];
        page.options.createMultiOpt("pStarsName", "Filter pornstar names by", sortOptions, function(v) {
            service.pStarsName = v;
		});
	}
	
    function setChannelsPageOptions(page) {
        var sortOptions = [
            ["","Videos",                 (service.channelsSort == "")],
            ["name","Name",               (service.channelsSort == "name")],
            ["date","Date added",         (service.channelsSort == "date")],
            ["subscribers","Subscribers", (service.channelsSort == "subscribers")],
            ["likes","Likes",             (service.channelsSort == "likes")]
        ];
        page.options.createMultiOpt("channelsSort", "Sort by", sortOptions, function(v) {
            service.channelsSort = v;
		});

        var sortOptions = [
            ["","Any Name", (service.channelsName == "")],
            ["a","A", (service.channelsName == "a")],
            ["b","B", (service.channelsName == "b")],
            ["c","C", (service.channelsName == "c")],
            ["d","D", (service.channelsName == "d")],
            ["e","E", (service.channelsName == "e")],
            ["f","F", (service.channelsName == "f")],
            ["g","G", (service.channelsName == "g")],
            ["h","H", (service.channelsName == "h")],
            ["i","I", (service.channelsName == "i")],
            ["j","J", (service.channelsName == "j")],
            ["k","K", (service.channelsName == "k")],
            ["l","L", (service.channelsName == "l")],
            ["m","M", (service.channelsName == "m")],
            ["n","N", (service.channelsName == "n")],
            ["o","O", (service.channelsName == "o")],
            ["p","P", (service.channelsName == "p")],
            ["r","R", (service.channelsName == "r")],
            ["s","S", (service.channelsName == "s")],
            ["t","T", (service.channelsName == "t")],
            ["u","U", (service.channelsName == "u")],
            ["v","V", (service.channelsName == "v")],
            ["w","W", (service.channelsName == "w")],
            ["x","X", (service.channelsName == "x")],
            ["y","Y", (service.channelsName == "y")],
            ["z","Z", (service.channelsName == "z")]
        ];
        page.options.createMultiOpt("channelsName", "Filter channel names by", sortOptions, function(v) {
            service.channelsName = v;
		});
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
        var re = /button data-id="(\d+)"/;
        var matchInfo = re.exec(doc);
        var mediaID  = matchInfo[1];
        var playQual = service.maxVideoRes;//matchInfo[2];
        if (playQual > eval(service.maxVideoRes)) playQual = service.maxVideoRes
        var tempUrl  = "http://tkn.4tube.com/" + mediaID + "/desktop/" + playQual;
        var doc = showtime.httpReq(tempUrl, {
            debug: false,
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
        setPageHeader(page, plugin.getDescriptor().id + " - " + unescape(title) + " -  Filter: " + service.sort + " " + service.quality + " " + service.duration + " " + service.time);
        index(page, url);
    });

    // Enter category
    plugin.addURI(plugin.getDescriptor().id + ":category:(.*):(.*)", function(page, title, url) {
        setPageHeader(page, plugin.getDescriptor().id + " - " + unescape(title) + " -  Filter: " + service.sort + " " + service.quality + " " + service.duration + " " + service.time);
        index(page, url);
    });

    // Pornstar page
    plugin.addURI(plugin.getDescriptor().id + ":pornstar:(.*):(.*)", function(page, url, title) {
        setPageHeader(page, plugin.getDescriptor().id + " - " + unescape(title) + " -  Filter: " + service.sort + " " + service.quality + " " + service.duration + " " + service.time);
        index(page, url);
    });

    // Pornstars page
    plugin.addURI(plugin.getDescriptor().id + ":pornstars", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + " - Pornstars -  Filter: " + service.pStarsName + " " + service.pStarsSort);
        indexPornstars(page);
    });

    // Channel page
    plugin.addURI(plugin.getDescriptor().id + ":channel:(.*):(.*)", function(page, url, title) {
        setPageHeader(page, plugin.getDescriptor().id + " - " + unescape(title) + " -  Filter: " + service.sort + " " + service.quality + " " + service.duration + " " + service.time);
        index(page, url);
    });

    // Channels page
    plugin.addURI(plugin.getDescriptor().id + ":channels", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + " - Channels -  Filter: " + service.channelsName + " " + service.channelsSort);
        indexChannels(page);
    });

    // Main page
//    plugin.addURI(plugin.getDescriptor().id + ":movies", function(page) {
//        setPageHeader(page, plugin.getDescriptor().id + " - Sorted by ");
//        index(page, "/videos");
//    });


    // Categories page
    plugin.addURI(plugin.getDescriptor().id + ":categories", function(page) {
        setPageHeader(page, plugin.getDescriptor().id + " - Categories -  Filter: " + service.catSort);
        setCatPageOptions(page);
        page.loading = true;
        var url = "/tags";
        if (service.catSort != "") url += "?sort=" + service.catSort;
        
        var doc = showtime.httpReq(checkLink(url)).toString();
        page.loading = false;

        // Categories with icons
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
        
        // All categories (no icons)
		page.appendItem("", "separator", {
			title: "- All categories (no icons) -"
		});
        var mp = doc.match(/All categories([\S\s]*?)categories_page/)[1];
        //                  1-link                  2-title            3-numofvideos                          4-icon
        var re = /<a href="([\S\s]*?)" [\S\s]*?">\n([\S\s]*?) <span>\(([\S\s]*?)\)/g;
        var match = re.exec(mp);
        while (match) {
			var title = match[2].replace(/^\s+/g, ''); // remove leading spaces
            page.appendItem(plugin.getDescriptor().id + ":sorting:" + escape(title) + ":" + escape(match[1]), "directory", {
                title: new showtime.RichText(title + colorStr(match[3].replace(",","."), blue))
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
        setPStarsPageOptions(page);
        var url = "/pornstars";
        // add filter and sorting
        if (service.pStarsName != "") url += "/" + service.pStarsName;
        if (service.pStarsSort != "") url += "?sort=" + service.pStarsSort;

        page.loading = true;
        page.entries = 0;
        var tryToSearch = true;

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
				page.loading = false;
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

    function indexChannels(page) {
        setChannelsPageOptions(page);
        var url = "/channels";
        // add filter and sorting
        if (service.channelsName != "") url += "/" + service.channelsName;
        if (service.channelsSort != "") url += "?sort=" + service.channelsSort;

        page.loading = true;
        page.entries = 0;
        var tryToSearch = true;

        function scraper(doc) {
        //                                1-link             2-title                             3-videos                              4-icon,
            var re = /"thumb-link" href="([\S\s]*?)" title="([\S\s]*?)"[\S\s]*?icon-video"><\/i>([\S\s]*?)<[\S\s]*?img data-original="([\S\s]*?)"/g;
            var match = re.exec(doc);

			while (match) {
				page.appendItem(plugin.getDescriptor().id + ":channel:" + escape(match[1]) + ":" + escape(match[2]), "video", {
					title: new showtime.RichText(match[2] + colorStr(match[3], orange)),
					icon: match[4]
//					description: new showtime.RichText(coloredStr("Twitter: ", orange) + match[4])
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
				page.loading = false;
				scraper(doc.match(/channels_page([\S\s]*?)"pagination"/)[1]);
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
        // If searcher, do not add options 
        if (url.indexOf("?")>-1)
           url += "&sort=" + service.sort;
        else
        {
           setPageOptions(page);
           // add filters
           url += "?sort=" + service.sort;
           if (service.duration != "") url += "&duration=" + service.duration;
           if (service.time     != "") url += "&time="     + service.time;
           if (service.quality  != "") url += "&quality="  + service.quality;
        }

        page.loading = true;
        page.entries = 0;
        var tryToSearch = true;

        function scraper(doc) {
            //                                        1-link                      2-title                               3-icon      4-HD ?                   5-length
            var re = />Watch Later<\/button><a href="([\S\s]*?)" [\S\s]*? title="([\S\s]*?)" [\S\s]*?<img data-master="([\S\s]*?)" ([\S\s]*?)"duration-top">([\S\s]*?)</g;
            var match = re.exec(doc);
			while (match) {
				var hdString = "";
				if (match[4].match(/>HD<\/li>/)) hdString = "[HD]";
				page.appendItem(plugin.getDescriptor().id + ":play:" + escape(match[1]) + ":" + escape(match[2]), "video", {
					title: new showtime.RichText(coloredStr(hdString, orange) + match[2] + colorStr(match[5], orange)),
					icon: match[3],
//					description: new showtime.RichText(coloredStr("Views: ", orange) + match[6] + " - " + coloredStr("Uploaded: ", orange) + match[7]),
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
        setPageHeader(page, plugin.getDescriptor().id + " - All Videos -  Filter: " + service.sort + " " + service.quality + " " + service.duration + " " + service.time);
        page.appendItem(plugin.getDescriptor().id + ":categories", "directory", {
            title: "Categories"
        });
        page.appendItem(plugin.getDescriptor().id + ":pornstars", "directory", {
            title: "Pornstars"
        });
        page.appendItem(plugin.getDescriptor().id + ":channels", "directory", {
            title: "Channels"
        });
        index(page, "/videos");
    });

    plugin.addSearcher(plugin.getDescriptor().id, logo, function(page, query) {
        index(page, "/search?q=" + query.replace(/\s/g, "\+"));
    });
})(this);
