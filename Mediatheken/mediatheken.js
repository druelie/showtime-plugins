/*
 *  Mediatheken
 *
 *  Copyright (C) 2014 Michael Hansen, druelie
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

var XML = require('showtime/xml');

(function(plugin) {
    var pInfo = plugin.getDescriptor();
    var PREFIX = pInfo.id;
    var logo = plugin.path + 'mediatheken.png';

    plugin.createService(pInfo.title, PREFIX + ':start', 'video', true, logo);

    // Start page
    plugin.addURI(PREFIX + ':start', function(page) {
	page.type = 'directory';
	page.metadata.glwview = plugin.path + 'views/array.view';
	page.contents = 'items';
	page.metadata.logo = logo;
	page.metadata.title = pInfo.title;
        page.appendItem(PREFIX + ':ard', 'station', {
	    station: 'ARD',
	    title: 'ARD',
	    description: 'Mediathek der ARD',
	    icon: plugin.path + 'img/ARD.png'
	});
        page.appendItem(PREFIX + ':zdf', 'directory', {
	    station: 'ZDF',
	    title: 'ZDF',
	    description: 'Mediathek des ZDF',
	    icon: plugin.path + 'img/ZDF.png'
	});
        page.appendItem(PREFIX + ':ndr', 'directory', {
	    station: 'NDR',
	    title: 'NDR',
	    description: 'Mediathek des NDR',
	    icon: plugin.path + 'img/NDR.png'
	});
        page.appendItem(PREFIX + ':arte', 'directory', {
	    station: 'arte +7',
	    title: 'arte +7',
	    description: 'Mediathek von arte',
	    icon: plugin.path + 'img/arte7.png'
	});
        page.appendItem(PREFIX + ':3sat', 'directory', {
	    station: '3sat',
	    title: '3sat',
	    description: 'Mediathek von 3sat',
	    icon: plugin.path + 'img/3sat.png'
	});
        page.appendItem(PREFIX + ':rtl', 'directory', {
	    station: 'RTL now',
	    title: 'RTL now',
	    description: 'Mediathek von RTL',
	    icon: plugin.path + 'img/RTLnow_.png'
	});
        page.appendItem(PREFIX + ':sat1', 'directory', {
	    station: 'Sat.1',
	    title: 'Sat.1',
	    description: 'Mediathek von Sat.1',
	    icon: plugin.path + 'img/Sat.1.png'
	});
        page.appendItem(PREFIX + ':vox', 'directory', {
	    station: 'VOX now',
	    title: 'VOX now',
	    description: 'Mediathek von VOX',
	    icon: plugin.path + 'img/VOXnow.png'
	});
        page.appendItem(PREFIX + ':kabel1', 'directory', {
	    station: 'Kabel 1',
	    title: 'Kabel 1',
	    description: 'Mediathek von Kabel 1',
	    icon: plugin.path + 'img/Kabel_eins.png'
	});
        page.loading = false;
    });

    // make HTML code strings readable
    function noHtmlCode(inString) {
        return inString.replace(/&quot;/g,'"').replace(/&apos;/,"'").replace(/&amp;/,'&').replace(/&gt;/,'>').replace(/&lt;/,'<'); 
    }

    // ARD main page
    plugin.addURI(PREFIX + ':ard', function(page) {
        var BASE_URL = 'http://www.ardmediathek.de/tv';
	    page.type = 'directory';
//	    page.metadata.glwview = plugin.path + 'views/array.view';
	    page.contents = 'items';
	    page.metadata.logo = logo;
	    page.metadata.title = 'ARD Mediathek - Sendungen A-Z';
        page.loading = true;
	    var doc = showtime.httpReq(BASE_URL).toString();
        var item = doc.match(/<a href="\/tv\/sendungen-a-z\?buchstabe=.*?">/g);

        for (var i=0; i < item.length; i++) {
            var letter = item[i].match(/buchstabe=(.*?)"/)[1];
            page.appendItem(PREFIX + ':ard:sendungen_a_z:' + letter, 'directory', {
		        station:     letter,
		        title:       letter
	        });
    	};
        page.loading = false;
    });
    
    // ARD Sendungen A-Z page
    plugin.addURI(PREFIX + ':ard:sendungen_a_z:(.*)', function(page, letter) {
        var BASE_URL = 'http://www.ardmediathek.de';
        var URL      = BASE_URL + '/tv/sendungen-a-z?buchstabe=' + letter;
	    page.type = 'directory';
	    page.metadata.glwview = plugin.path + 'views/array.view';
	    page.contents = 'items';
	    page.metadata.logo = logo;
	    page.metadata.title = 'ARD Mediathek - Sendungen ' + letter;
        page.loading = true;
        page.entries = 0;
	    var doc = showtime.httpReq(URL).toString();
	        doc = doc.match(/data-ctrl-layoutable([\S\s]*?)modSocialbar/)[1];
	    //                                     1-sUrl              2-icon                                          3-numVids                             4-title                      5-desc
	    var re = /"media mediaA"[\S\s]*?href="([\S\s]*?)"[\S\s]*?;(\/image\/[\S\s]*?)##width##[\S\s]*?"dachzeile">([\S\s]*?) Ausgabe[\S\s]*?"headline">([\S\s]*?)<[\S\s]*?"subtitle">([\S\s]*?)</g;
        var match = re.exec(doc);
        while (match) {
            var title   = match[4] + ' - ' + match[5];
            var iconUrl = BASE_URL + match[2] + '256';
            page.appendItem(PREFIX + ':ard:sendung:' + escape(match[1]) + ':' + escape(match[4]), 'video', {
		        station:     title,
		        title:       title,
		        description: 'Ausgaben: ' + match[3],
		        icon:        iconUrl,
		        album_art:   iconUrl
	        });
			page.entries++;
			match = re.exec(doc);
    	};
        page.loading = false;
    });
    
    // ARD Sendung
    plugin.addURI(PREFIX + ':ard:sendung:(.*):(.*)', function(page, sUrl, title) {
        var BASE_URL = 'http://www.ardmediathek.de';
        var URL      = BASE_URL + unescape(sUrl) + '&rss=true';
	    page.type = 'directory';
//	    page.metadata.glwview = plugin.path + 'views/array.view';
	    page.contents = 'items';
	    page.metadata.logo = logo;
	    page.metadata.title = 'ARD Mediathek - Sendung: ' + unescape(title);
        page.loading = true;
        page.entries = 0;
	    var doc = showtime.httpReq(URL).toString();
        var item = doc.match(/<item>([\S\s]*?)<\/item>/g);

        for (var i=0; i < item.length; i++) {
            var docId  = item[i].match(/documentId=([\S\s]*?)&/)[1];
            var vTitle = noHtmlCode(item[i].match(/<title>([\S\s]*?)<\/title>/)[1]);
                vTitle = vTitle.slice(unescape(title).length+3); // remove overall title
            var descr  = item[i].match(/<description>([\S\s]*?)<\/description>/)[1];
                descr  = descr.match(/\/&gt;&lt;\/p&gt;&lt;p&gt;([\S\s]*?) \|/)[1];
                descr  = descr.replace(/&lt;\/p&gt;&lt;p&gt;/,'\n\nVom: ');
            var icon   = item[i].match(/img src="([\S\s]*?)"/)[1];
            var pDate  = item[i].match(/<pubDate>([\S\s]*?)<\/pubDate>/)[1];
            // Skip live videos in future (they have no duration)
            if ( item[i].match(/\| ([\S\s]*?) Min. \|/) ) {
                var dura  = item[i].match(/\| ([\S\s]*?) Min. \|/)[1];
                if ( item[i].match(/<category>/) )
                    var categ = noHtmlCode(item[i].match(/<category>([\S\s]*?)<\/category>/)[1]);

         	    page.appendItem(PREFIX + ':ard:play:' + docId + ':' + escape(vTitle), 'video', {
		            station:     vTitle,
		            title:       vTitle,
		            description: descr,//.match(//)[1],
		            icon:        icon,
		            album_art:   icon,
		            album:       '',
		            duration:    dura,
                    genre:       categ
                });
                page.entries++;
            }
	    };
        page.loading = false;
    });
    
    // ARD play videolink
    plugin.addURI(PREFIX + ':ard:play:(.*):(.*)', function(page, docId, title) {
        page.loading = true;
        var vlUrl = 'http://www.ardmediathek.de/play/media/' + docId + '?devicetype=pc&features=flash';
        var doc = showtime.httpReq(vlUrl).toString();
        var videoUrl = '';
        if      (doc.indexOf('_quality":3') > -1) videoUrl = doc.match(/"_quality":3[\S\s]*?"_stream":"([\S\s]*?)"/)[1];
        else if (doc.indexOf('_quality":2') > -1) videoUrl = doc.match(/"_quality":2[\S\s]*?"_stream":"([\S\s]*?)"/)[1];
        else if (doc.indexOf('_quality":1') > -1) videoUrl = doc.match(/"_quality":1[\S\s]*?"_stream":"([\S\s]*?)"/)[1];
        else                                      videoUrl = doc.match(/"_quality":[\S\s]*?"_stream":"([\S\s]*?)"/)[1];
        
        // No direct video, but stream, so add stream server (not working)
        if (videoUrl.indexOf('http') === -1) videoUrl = doc.match(/"_server":"([\S\s]*?)"/)[1] + '/' + videoUrl ;
        
        var probeUrl = videoUrl.replace(/\.webl\./,'.webxl.'); // 720p for Tagesschau!
            probeUrl = probeUrl.replace(/_C.mp4/,'_X.mp4');    // 720p for br!
        if (showtime.probe(probeUrl).result === 0)
            videoUrl = probeUrl;
            
        showtime.print("Video URL: " + videoUrl);
        page.loading = false;
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            title: unescape(title),
            canonicalUrl: PREFIX + ":ard:play:" + docId + ":" + title,
            sources: [{
                url: videoUrl
            }]
        });
    });

//===== a r t e =================================================================================================================

    // arte page
    plugin.addURI(PREFIX + ':arte', function(page) {
        var BASE_URL = 'http://www.arte.tv';
	    page.type = 'directory';
	    page.metadata.glwview = plugin.path + 'views/array.view';
	    page.contents = 'items';
	    page.metadata.logo = logo;
	    page.metadata.title = 'arte +7';
        page.loading = true;
	    var doc = showtime.httpReq(BASE_URL+'/guide/de/plus7.json').toString();
        var json = showtime.JSONDecode(doc);

        for (var i in json.videos) {
            var arte_vp_url = 'http://arte.tv/papi/tvguide/videos/stream/player/D/' + json.videos[i].em + '_PLUS7-D/ALL/ALL.json';
            var vp = showtime.JSONDecode(showtime.httpReq(arte_vp_url).toString());

 	    page.appendItem(vp.videoJsonPlayer.VSR.HTTP_MP4_SQ_1.url, 'video', {
		    station:     json.videos[i].title,
		    title:       json.videos[i].title,
		    description: vp.videoJsonPlayer.VDE + '\n\nVerfügbar seit: ' + json.videos[i].airdate_long,
		    icon:        json.videos[i].image_url,
		    album_art:   json.videos[i].image_url,
		    album:       json.videos[i].video_channels,
		    duration:    vp.videoJsonPlayer.VDU,
		    genre:       vp.videoJsonPlayer.genre,
            views:       vp.videoJsonPlayer.VVI,
		    rating:      vp.videoJsonPlayer.videoRank * 10
	    });
	};
        page.loading = false;
    });

//========= 3 s a t ==============================================================================================================

    // 3sat page
    plugin.addURI(PREFIX + ':3sat', function(page) {
        page.type = 'directory';
        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = '3sat Mediathek';
        page.loading = true;

        page.appendItem(PREFIX + ":3sat:sendungen", "directory", {
            title:   "Sendungen",
            station: "Sendungen",
        });

        var xmlUrl = 'http://www.3sat.de/mediathek/rss/mediathek.xml';
        indexVideosFromXml(page, xmlUrl);
        page.loading = false;
    });

    function indexVideosFromXml(page, xmlUrl) {
        var doc = unescape(showtime.httpReq(xmlUrl).toString());
            doc = doc.replace(/media:/g,"media_");

        var item = doc.match(/<item>([\S\s]*?)<\/item>/g);

        for (var i=0; i < item.length; i++) {
            var video_url = item[i].match(/<enclosure url="([\S\s]*?)"/)[1];
            var object    = item[i].match(/obj=([\S\s]*?)</)[1];
            var title     = noHtmlCode(item[i].match(/<title>([\S\s]*?)<\/title>/)[1]);
            var descr     = noHtmlCode(item[i].match(/<description>([\S\s]*?)<\/description>/)[1]);
            var icon      = item[i].match(/thumbnail url="([\S\s]*?)"/)[1];

     	    page.appendItem(PREFIX + ':3sat:play:' + object + ':' + escape(title), 'video', {
		        station:     title,
		        title:       title,
		        description: descr,
		        icon:        icon,
		        album_art:   icon,
		        album:       '',
		        duration:    item[i].match(/duration="([\S\s]*?)"/)[1]/60,
                genre:       ''//item[i].match(/category>([\S\s]*?)</)[1]
            });
	    };
    }

    // 3sat Sendungen
    plugin.addURI(PREFIX + ':3sat:sendungen', function(page) {
        page.type = 'directory';
        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'Sendungen';
        page.loading = true;

        var SNDN_URL = 'http://www.3sat.de/page/?source=/specials/133576/index.html';
        var doc = unescape(showtime.httpReq(SNDN_URL).toString());

        var sendung = doc.match(/\/mediaplayer\/rss\/mediathek_([\S\s]*?)xml/g);
        
        for (var i=0; i < sendung.length; i++) {
            var sTitle = sendung[i].match(/mediathek_([\S\s]*?).xml/)[1];
            var cTitle = sTitle.charAt(0).toUpperCase() + sTitle.slice(1);
     	    page.appendItem(PREFIX + ':3sat:sendung:' + sTitle, 'video', {
		        station:     cTitle,
		        title:       cTitle
            });
	    };
        
        page.loading = false;
    });

    // 3sat Sendung Videos
    plugin.addURI(PREFIX + ':3sat:sendung:(.*)', function(page, sendung) {
        page.type = 'directory';
        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.title = sendung;
        page.loading = true;
        
        var xmlUrl = 'http://www.3sat.de/mediaplayer/rss/mediathek_' + sendung + '.xml';
        indexVideosFromXml(page, xmlUrl);
        page.loading = false;
    });


    // 3sat play videolink
    plugin.addURI(PREFIX + ':3sat:play:(.*):(.*)', function(page, object, title) {
        page.loading = true;
        var doc = showtime.httpReq('http://www.3sat.de/mediathek/xmlservice/web/beitragsDetails?id=' + object).toString();
        var videoUrl = doc.match(/<formitaet basetype="h264_aac_mp4_http_na_na" isDownload="false">\n<quality>veryhigh<\/quality>\n<url>(http:\/\/.*?rodl[\S\s]*?mp4)</)[1];
        page.loading = false;
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            title: unescape(title),
            canonicalUrl: PREFIX + ":3sat:play:" + object + ":" + title,
            sources: [{
                url: videoUrl
            }]
        });
    });

})(this);
