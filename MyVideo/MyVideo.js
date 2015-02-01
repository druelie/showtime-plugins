/*
 *  MyVideo - Showtime Plugin
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
    var BASE_URL = "https://papi.myvideo.de";
    var pInfo  = plugin.getDescriptor();
    var PREFIX = pInfo.id;
    var TITLE  = pInfo.title
    var logo   = plugin.path + "MyVideo.png";

    var blue = "6699CC", orange = "FFA500";
    var tabletHeaders = {
            "X-PAPI-AUTH": "39927b3f31d7c423ad6f862e63d8436d954aecd0",
            "Host": "papi.myvideo.de",
            "Connection": "Keep-Alive",
            "User-Agent": "Not set yet"
        };
    var tabletReqParams = {
            debug: false,
            method: "GET",
            headers: tabletHeaders
        };

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
    }
    
    plugin.createService(TITLE, PREFIX + ':start', 'video', true, logo);

    // Start page
    plugin.addURI(PREFIX + ":start", function(page) {
        page.loading = true;
        setPageHeader(page, TITLE);

        var URL = "https://papi.myvideo.de/static/myvideo.json";
        var doc = showtime.httpReq(URL, tabletReqParams).toString();
        var json = showtime.JSONDecode(doc);
        var menu_items = json.menubar.channels[0].menu_items;

        for (var i in menu_items) {
            if (menu_items[i].link_type == "home") {
                URL = BASE_URL + menu_items[i].link.replace(/platzhalter/, "tablet");
            }
            else if (menu_items[i].link_type == "BasicPage") {
                page.appendItem(PREFIX + ":screen:" + escape(menu_items[i].link) + ":" + escape(menu_items[i].displayName), "directory", {
                    title: menu_items[i].displayName
                });
            }
            else if (menu_items[i].link_type == "FormatGrid") {
                page.appendItem(PREFIX + ":screen:" + escape(menu_items[i].link) + ":" + escape(menu_items[i].displayName), "directory", {
                    title: menu_items[i].displayName
                });
            }
        }
        var doc = showtime.httpReq(URL, tabletReqParams).toString();
        var json = showtime.JSONDecode(doc);
        var screen_objects = json.screen.screen_objects;

        page.appendItem("", "separator", {title: "Home"});
        for (var i in screen_objects) {
            if (screen_objects[i].type == "sushi_bar") {
				page.appendItem("", "separator", {title: screen_objects[i].title});
            }
            indexScreenObjects(page, screen_objects[i].screen_objects, "Home");
        }
        page.loading = false;
    });
        
    // Screen page
    plugin.addURI(PREFIX + ":screen:(.*):(.*)", function(page, screenUrl, title) {
        page.loading = true;
        setPageHeader(page, TITLE + " - " + unescape(title));

        var URL = "https://papi.myvideo.de" + screenUrl.replace(/platzhalter/, "tablet");
        var doc = showtime.httpReq(URL, tabletReqParams).toString();
        var json = showtime.JSONDecode(doc);
        if (title == "Mehr")
            var screen_objects = json.screen.screen_objects[0].screen_objects;
        else
            var screen_objects = json.screen.screen_objects;

        for (var i in screen_objects) {
            if (screen_objects[i].type == "sushi_bar" ||
                screen_objects[i].type == "grid_page" ||
                screen_objects[i].type == "video_grid_page") {
				page.appendItem("", "separator", {title: screen_objects[i].title});
            }
            indexScreenObjects(page, screen_objects[i].screen_objects, unescape(title));
        }
        page.loading = false;
    });

    function indexScreenObjects(page, screen_objects, screen_title) {
        for (var j in screen_objects) {
            if (screen_objects[j].type == "home_header_item") {
                var vTitle = screen_objects[j].title;
                if (screen_objects[j].subtitle) vTitle += " - " + screen_objects[j].subtitle;
                var URI = PREFIX + ":play:" + screen_objects[j].id + ":" + escape(vTitle);
            }
            else if (screen_objects[j].type == "video_item") {
                if (screen_objects[j].format_title == screen_title)
                    var vTitle = "";
                else
                    var vTitle = screen_objects[j].format_title;
                if (vTitle) vTitle += " - ";
                vTitle += screen_objects[j].video_title;
                var URI = PREFIX + ":play:" + screen_objects[j].id + ":" + escape(vTitle);
            }
            else if (screen_objects[j].type == "citylight_item") {
                var vTitle = screen_objects[j].video_title;
                var URI = PREFIX + ":play:" + screen_objects[j].id + ":" + escape(vTitle);
            }
            else if (screen_objects[j].type == "format_item") {
                var vTitle = screen_objects[j].title;
                var URI = PREFIX + ":screen:" + escape(screen_objects[j].link) + ":" + escape(vTitle);
            }

            var vIcon = screen_objects[j].image_url.replace(/\\/g,'').replace(/\/1948\//,"/420/"); // smaller icons for faster loading
            var vLink = screen_objects[j].link.replace(/\\/g,'');
            page.appendItem(URI, "video", {
                title: vTitle,
                icon: vIcon,
                duration: screen_objects[j].label,
                description: screen_objects[j].publishing_date
            });
        }
    }
        
    // Play videolink
    plugin.addURI(plugin.getDescriptor().id + ":play:(.*):(.*)", function(page, clipid, title) {
        page.loading = true;
        var URL = BASE_URL + "/myvideo-app/v1/vas/video.json?clipid=" + clipid + "&app=megapp&method=4";
        var doc = showtime.httpReq(URL, tabletReqParams).toString();
        showtime.trace("Videoserver response: "+doc,"AC");
        var json = showtime.JSONDecode(doc);
        var videoUrl = json.VideoURL.replace(/\\/,'');
        page.loading = false;
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            title: unescape(title),
            canonicalUrl: plugin.getDescriptor().id + ":play:" + clipid + ":" + title,
            sources: [{
                url: videoUrl
            }]
        });
    });
})(this);
