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

    var blue = "6699CC", orange = "FFA500";

    function coloredStr(str, color) {
        return '<font color="' + color + '">' + str + '</font>';
    }

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
//        page.appendItem(PREFIX + ':rtl', 'directory', {
    //        station: 'RTL now',
    //        title: 'RTL now',
    //        description: 'Mediathek von RTL',
    //        icon: plugin.path + 'img/RTLnow_.png'
    //    });
//        page.appendItem(PREFIX + ':sat1', 'directory', {
    //        station: 'Sat.1',
    //        title: 'Sat.1',
    //        description: 'Mediathek von Sat.1',
    //        icon: plugin.path + 'img/Sat.1.png'
    //    });
//        page.appendItem(PREFIX + ':vox', 'directory', {
    //        station: 'VOX now',
    //        title: 'VOX now',
    //        description: 'Mediathek von VOX',
    //        icon: plugin.path + 'img/VOXnow.png'
    //    });
//        page.appendItem(PREFIX + ':kabel1', 'directory', {
    //        station: 'Kabel 1',
    //        title: 'Kabel 1',
    //        description: 'Mediathek von Kabel 1',
    //        icon: plugin.path + 'img/Kabel_eins.png'
    //    });
        page.loading = false;
    });

    // make HTML code strings readable
    function noHtmlCode(inString) {
        return inString.replace(/&quot;/g,'"').replace(/&#034;/g,'"').replace(/&apos;/g,"'").replace(/&#039;/g,"'").replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&auml;/g,'ä').replace(/&Auml;/g,'Ä').replace(/&ouml;/g,'ö').replace(/&Ouml;/g,'Ö').replace(/&uuml;/g,'ü').replace(/&Uuml;/g,'Ü'); 
    }

//===== A R D =================================================================================================================

    // ARD main page
    plugin.addURI(PREFIX + ':ard', function(page) {
        var BASE_URL = 'http://www.ardmediathek.de/tv';
        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'ARD Mediathek - Sendungen A-Z';

        page.appendItem(PREFIX + ':ard:suche', 'directory', {
            station:     'Suche',
            title:       'Suche'
        });

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
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'ARD Mediathek - Sendungen ' + letter;
        page.loading = true;
        page.entries = 0;
        var doc = showtime.httpReq(URL).toString();
            doc = doc.match(/data-ctrl-layoutable([\S\s]*?)SocialBar/)[1];
        //                                     1-sUrl              2-icon                                          3-numVids                             4-title                      5-desc
        var re = /"media mediaA"[\S\s]*?href="([\S\s]*?)"[\S\s]*?;(\/image\/[\S\s]*?)##width##[\S\s]*?"dachzeile">([\S\s]*?) Ausgabe[\S\s]*?"headline">([\S\s]*?)<[\S\s]*?"subtitle">([\S\s]*?)</g;
        var match = re.exec(doc);
        while (match) {
            var title   = noHtmlCode(match[4] + ' - ' + match[5]);
            var iconUrl = BASE_URL + match[2] + '256';
            page.appendItem(PREFIX + ':ard:sendung:' + escape(match[1]) + ':' + escape(noHtmlCode(match[4])), 'video', {
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
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'ARD Mediathek - Sendung: ' + noHtmlCode(unescape(title));
        page.loading = true;
        page.entries = 0;
        var doc = showtime.httpReq(URL).toString();
        var item = doc.match(/<item>([\S\s]*?)<\/item>/g);

        if (item) {
            for (var i=0; i < item.length; i++) {
                var docId  = item[i].match(/documentId=([\S\s]*?)&/)[1];
                var vTitle = item[i].match(/<title>([\S\s]*?)<\/title>/)[1];
                    vTitle = noHtmlCode(vTitle.slice(unescape(title).length+3)); // remove overall title
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
        }
        page.loading = false;
    });
    
    // ARD play videolink
    plugin.addURI(PREFIX + ':ard:play:(.*):(.*)', function(page, docId, title) {
        page.loading = true;
        var vlUrl = 'http://www.ardmediathek.de/play/media/' + docId + '?devicetype=pc&features=flash';
        var doc = showtime.httpReq(vlUrl).toString();
        if ( doc.match(/"_plugin":1,"_mediaStreamArray":\[([\S\s]*?)_sortierArray/) )
            doc = doc.match(/"_plugin":1,"_mediaStreamArray":\[([\S\s]*?)_sortierArray/)[1];
        else
            doc = doc.match(/"_plugin":0,"_mediaStreamArray":\[([\S\s]*?)_sortierArray/)[1];
        var videoUrl = '';
        if      (doc.indexOf('_quality":3') > -1) videoUrl = doc.match(/"_quality":3[\S\s]*?"_stream":[\S\s]*?"([\S\s]*?)"/)[1];
        else if (doc.indexOf('_quality":2') > -1) videoUrl = doc.match(/"_quality":2[\S\s]*?"_stream":[\S\s]*?"([\S\s]*?)"/)[1];
        else if (doc.indexOf('_quality":1') > -1) videoUrl = doc.match(/"_quality":1[\S\s]*?"_stream":[\S\s]*?"([\S\s]*?)"/)[1];
        else                                      videoUrl = doc.match(/"_quality":[\S\s]*?"_stream":[\S\s]*?"([\S\s]*?)"/)[1];
        
        // No direct video, but stream, so add stream server
        if (videoUrl.indexOf('http') === -1) videoUrl = doc.match(/"_server":"([\S\s]*?)"/)[1] + videoUrl ;
        
        var probeUrl = videoUrl.replace(/\.webl\./,'.webxl.'); // 720p for Tagesschau!
            probeUrl = probeUrl.replace(/_C.mp4/,'_X.mp4');    // 720p for br!
        if (showtime.probe(probeUrl).result === 0)
            videoUrl = probeUrl;
            
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
    
    plugin.addURI(PREFIX + ':ard:suche', function(page) {
        var query = showtime.textDialog('Suche in der ARD Mediathek nach:', true, false).input;
        indexArdSearch(page, "http://www.ardmediathek.de/tv/suche?source=tv&searchText=" + query.replace(/\s/g, "\+"), query);
    });
    
    plugin.addSearcher(PREFIX + ' - ARD', logo, function(page, query) {
        indexArdSearch(page, "http://www.ardmediathek.de/tv/suche?source=tv&searchText=" + query.replace(/\s/g, "\+"), query);
    });
    
    function indexArdSearch(page, sUrl, query) {
        var BASE_URL = 'http://www.ardmediathek.de';
        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'ARD Mediathek - Suchergebnis für: ' + query;
        page.entries = 0;
        var tryToSearch = true;

        function searchAndAppendVideos(doc) {
            doc = doc.match(/Sortiert nach Datum([\S\s]*?)&gt;/)[1];
            //                    1-docId                  2-icon                                         3-Title                       4-sub                 5-desc
            var re = /documentId=([\S\s]*?)\&amp;[\S\s]*?;(\/image\/[\S\s]*?)##width##[\S\s]*?"headline">([\S\s]*?)<[\S\s]*?"subtitle">([\S\s]*?)<[\S\s]*?"teasertext">([\S\s]*?)</g;
            var match = re.exec(doc);
            while (match) {
                var title   = noHtmlCode(match[3]);
                var iconUrl = BASE_URL + match[2] + '256';
                var subTitle= match[4];
                var descr   = noHtmlCode(match[5]) + '\n\n' + subTitle;
                var dura    = subTitle.match(/\| ([\S\s]*?) \|/)[1];
                var genre   = subTitle.match(/\| ([\S\s]*?) \| ([\S\s]*.)/)[2];
                page.appendItem(PREFIX + ':ard:play:' + match[1] + ':' + escape(title), 'video', {
                    station:     title,
                    title:       title,
                    description: descr,
                    icon:        iconUrl,
                    album_art:   iconUrl,
                    album:       '',
                    duration:    dura,
                    genre:       genre
                });
                page.entries++;
                match = re.exec(doc);
            };
        }
        
        var firstTime = true;
        function loader() {
            if (!tryToSearch) return false;
            page.loading = true;
            var doc = showtime.httpReq(sUrl).toString();
            if ( firstTime ) {
                page.metadata.title = page.metadata.title + ' (' + doc.match(/ergab <strong>([\S\s]*? Treffer)</)[1] + ')';
                firstTime = false;
            }

            searchAndAppendVideos(doc);
            page.loading = false;

            var next = doc.match(/>Zur nächsten Seite<([\S\s]*?)href="([\S\s]*?)"/);
            if (!next) return tryToSearch = false;
            sUrl = BASE_URL + next[2].replace(/&amp;/g,'&');
            return true;
        }
        
        loader();
        page.paginator = loader;
    }

//===== Z D F =================================================================================================================

    // ZDF main page
    plugin.addURI(PREFIX + ':zdf', function(page) {
        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'ZDF Mediathek - Sendungen A-Z';
        page.appendItem(PREFIX + ':zdf:suche',             'directory', {station: 'Suche',title: 'Suche'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:A:C', 'directory', {station: 'ABC',  title: 'ABC'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:D:F', 'directory', {station: 'DEF',  title: 'DEF'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:G:I', 'directory', {station: 'GHI',  title: 'GHI'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:J:L', 'directory', {station: 'JKL',  title: 'JKL'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:M:O', 'directory', {station: 'MNO',  title: 'MNO'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:P:S', 'directory', {station: 'PQRS', title: 'PQRS'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:T:V', 'directory', {station: 'TUV',  title: 'TUV'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:W:Z', 'directory', {station: 'WXYZ', title: 'WXYZ'});
        page.appendItem(PREFIX + ':zdf:sendungen_a_z:0-9:0-9', 'directory', {station: '0-9', title: '0-9'});
    });
    
    // ZDF Sendungen A-Z page
    plugin.addURI(PREFIX + ':zdf:sendungen_a_z:(.*):(.*)', function(page, start, end) {
        var BASE_URL = 'http://www.zdf.de';
        var URL      = BASE_URL + '/ZDFmediathek/xmlservice/web/sendungenAbisZ?characterRangeStart=' + start + '&characterRangeEnd=' + end + '&detailLevel=2';
        page.type = 'directory';
        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'ZDF Mediathek - Sendungen ' + start + ' bis ' + end;
        page.loading = true;
        page.entries = 0;
        var doc = showtime.httpReq(URL).toString();
        var item = doc.match(/<teaser [\S\s]*?<\/teaser>/g);

        for (var i=0; i < item.length; i++) {
            var icon     = item[i].match(/<teaserimage[\S\s]*?key="173x120">([\S\s]*?)<\/teaserimage>/)[1];
            var title    = noHtmlCode(item[i].match(/<title>([\S\s]*?)<\/title>/)[1]);
            var sTitle   = noHtmlCode(item[i].match(/<shortTitle>([\S\s]*?)<\/shortTitle>/)[1]);
            var descr    = item[i].match(/<detail>([\S\s]*?)<\/detail>/)[1];
            var assetId  = item[i].match(/<assetId>([\S\s]*?)<\/assetId>/)[1];
            var channel  = item[i].match(/<channel>([\S\s]*?)<\/channel>/)[1];
            var duration = item[i].match(/<length>([\S\s]*?)<\/length>/)[1];

            if ( item[i].match(/<category>/) )
                var categ = noHtmlCode(item[i].match(/<category>([\S\s]*?)<\/category>/)[1]);

            if ( duration != '0' ) {
                page.appendItem(PREFIX + ':zdf:sendung:' + assetId + ':' + escape(title), 'video', {
                    station:     sTitle,
                    title:       title,
                    description: descr,
                    icon:        icon,
                    album_art:   icon,
                    album:       '',
                    duration:    duration,
                    genre:       channel
                });
                page.entries++;
            }
        };
        page.loading = false;
    });
    
    // ZDF Beiträge einer Sendung
    plugin.addURI(PREFIX + ':zdf:sendung:(.*):(.*)', function(page, assetId, title) {
        var URL = 'http://www.zdf.de/ZDFmediathek/xmlservice/web/aktuellste?id=' + assetId + '&maxLength=50&offset=0';
        indexZdfItems(page, URL, 'Sendung: ' + title);
    });

    plugin.addURI(PREFIX + ':zdf:suche', function(page) {
        var query = showtime.textDialog('Suche in der ZDF Mediathek nach:', true, false).input;
        var URL = "http://www.zdf.de/ZDFmediathek/xmlservice/web/detailsSuche?maxLength=50&searchString=" + query.replace(/\s/g, "\+");
        indexZdfItems(page, URL, 'Suchergebnis für: ' + query);
    });
    
    plugin.addSearcher(PREFIX + ' - ZDF', logo, function(page, query) {
        var URL = "http://www.zdf.de/ZDFmediathek/xmlservice/web/detailsSuche?maxLength=50&searchString=" + query.replace(/\s/g, "\+");
        indexZdfItems(page, URL, 'Suchergebnis für: ' + query);
    });

    function indexZdfItems(page, url, title) {
        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'ZDF Mediathek - ' + unescape(title);
        page.loading = true;
        page.entries = 0;
        var doc = showtime.httpReq(url).toString();
        if ( doc.match(/<batch>([\S\s]*?)<\/batch>/) ) // Anzahl der Suchergebnisse
            page.metadata.title += ' (' + doc.match(/<batch>([\S\s]*?)<\/batch>/)[1] + ' Treffer)';
        var item = doc.match(/<teaser>[\S\s]*?<\/teaser>/g);

        if (item) {
            for (var i=0; i < item.length; i++) {
                var type = item[i].match(/<type>([\S\s]*?)<\/type>/)[1];
                if ( type == 'video' || type == 'thema' || type == 'sendung' || type == 'einzelsendung' )
                {
                    var icon       = item[i].match(/<teaserimage[\S\s]*?key="173x120">([\S\s]*?)<\/teaserimage>/)[1];
                    var title      = noHtmlCode(item[i].match(/<title>([\S\s]*?)<\/title>/)[1]);
                    var descr      = item[i].match(/<detail>([\S\s]*?)<\/detail>/)[1];
                    var assetId    = item[i].match(/<assetId>([\S\s]*?)<\/assetId>/)[1];
                    if (item[i].match(/<channel>/))
                        var channel = item[i].match(/<channel>([\S\s]*?)<\/channel>/)[1];
                    var duration   = item[i].match(/<length>([\S\s]*?)<\/length>/)[1];
                        duration   = duration.replace(/\.000/,'');
                    if (item[i].match(/<airtime>/))
                        var airtime = item[i].match(/<airtime>([\S\s]*?)<\/airtime>/)[1];
                }
     
                if ( type == 'video' )
                {
                    var uri = PREFIX + ':zdf:play:' + assetId + ':' + escape(title);
                    var timetolive = item[i].match(/<timetolive>([\S\s]*?)<\/timetolive>/)[1];
                    descr += '\n\n\nVom: ' + airtime + '   -   Verfügbar bis: ' + timetolive;
                }
                else if ( type == 'thema' || type == 'sendung' || type == 'einzelsendung' )
                {
                    var uri = PREFIX + ':zdf:sendung:' + assetId + ':' + escape(title);
                    if (airtime) descr += '\n\n\nVom: ' + airtime;
                }
//                else
//                    showtime.print('Kein VIDEO!!! Item '+i+' Typ: '+type);

                if ( type == 'video' || type == 'thema' || type == 'sendung' || type == 'einzelsendung' )
                {
                    page.appendItem(uri, 'video', {
                        station:     title,
                        title:       title,
                        description: descr,
                        icon:        icon,
                        album_art:   icon,
                        album:       '',
                        duration:    duration,
                        genre:       channel
                    });
                    page.entries++;
                }
            }
        }
        page.loading = false;
    }
    
    // ZDF play videolink
    plugin.addURI(PREFIX + ':zdf:play:(.*):(.*)', function(page, object, title) {
        page.loading = true;
        var doc = showtime.httpReq('http://www.zdf.de/ZDFmediathek/xmlservice/web/beitragsDetails?id=' + object).toString();
        if (doc.match(/basetype="h264_aac_mp4_http_na_na"[\S\s]*?<quality>veryhigh<\/quality>\n\s+<url>(.*?rodl[\S\s]*?mp4)<\/url>/))
        {
            var videoUrl = doc.match(/basetype="h264_aac_mp4_http_na_na"[\S\s]*?<quality>veryhigh<\/quality>\n\s+<url>(.*?rodl[\S\s]*?mp4)<\/url>/)[1];
//            showtime.print('1. ZDF Videolink: '+videoUrl);
        }
        else
        {
            var videoUrl = doc.match(/h264_aac_mp4_http_na_na[\S\s]*?<quality>veryhigh<\/quality>\n\s+<url>([\S\s]*?)<\/url>/)[1];
//            showtime.print('2. ZDF Videolink: '+videoUrl);
        }
        
        if (videoUrl.match(/vh\.mp4/)) {
          var probeUrl = videoUrl.replace(/vh\.mp4/,'hd.mp4'); // better quality?
//        var probeUrl = videoUrl.replace(/1456k_p13v11/,'3056k_p15v9'); // better quality?
            if (showtime.probe(probeUrl).result === 0)
                videoUrl = probeUrl;
        }
         
        page.loading = false;
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            title: unescape(title),
            canonicalUrl: PREFIX + ":zdf:play:" + object + ":" + title,
            sources: [{
                url: videoUrl
            }]
        });
    });
    
//===== N D R ===================================================================================================================

    // NDR main page
    plugin.addURI(PREFIX + ':ndr', function(page) {
        var URL  = 'http://www.ndr.de/mediathek/index.html';
        var vURL = '/mediathek/sendung_verpasst/epg1490_display-onlyvideo.html';
        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'NDR Mediathek';
        page.metadata.background = 'http://www.ndr.de/mediathek/media/mediathek239_v-contentxl.jpg';
        page.metadata.backgroundAlpha = 0.2;
        page.appendItem(PREFIX + ':ndr:suche', 'directory', {station: 'Suche',title: 'Suche'});
        page.appendItem(PREFIX + ':ndr:sendung_verpasst:' + escape(vURL), 'directory', {station: 'Sendung verpasst',title: 'Sendung verpasst'});
        page.appendItem(PREFIX + ':ndr:sendungen_a-z', 'directory', {station: 'Sendungen A-Z',title: 'Sendungen A-Z'});
        page.appendItem(PREFIX + ':ndr:play:/fernsehen/livestream/index.html:Livestream', 'directory', {station: 'Livestream',title: 'Livestream'});
		page.appendItem("", "separator", {title: "Aktuelles"});

        indexNdrVideos(page, URL, 'Startseite');
    });

    plugin.addURI(PREFIX + ':ndr:suche', function(page) {
        var query = showtime.textDialog('Suche in der NDR Mediathek nach:', true, false).input;
        var URL = "http://www.ndr.de/suche10.html?search_mediathek=1&results_per_page=50&query=" + query.replace(/\s/g, "\+");
        page.metadata.background = 'http://www.ndr.de/mediathek/media/mediathek239_v-contentxl.jpg';
        page.metadata.backgroundAlpha = 0.2;
        indexNdrVideos(page, URL, 'Suchergebnis für: ' + query);
    });
    
    plugin.addSearcher(PREFIX + ' - NDR', logo, function(page, query) {
        var URL = "http://www.ndr.de/suche10.html?search_mediathek=1&results_per_page=50&query=" + query.replace(/\s/g, "\+");
        page.metadata.background = 'http://www.ndr.de/mediathek/media/mediathek239_v-contentxl.jpg';
        page.metadata.backgroundAlpha = 0.2;
        indexNdrVideos(page, URL, 'Suchergebnis für: ' + query);
    });

    // Sendung verpasst
    plugin.addURI(PREFIX + ':ndr:sendung_verpasst:(.*)', function(page, sUrl) {
        var BASE_URL = 'http://www.ndr.de';
        sUrl = BASE_URL + unescape(sUrl);
        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'NDR Mediathek - Sendung verpasst';
        page.metadata.background = 'http://www.ndr.de/mediathek/media/mediathek239_v-contentxl.jpg';
        page.metadata.backgroundAlpha = 0.2;

        page.loading = true;
        var doc = showtime.httpReq(unescape(sUrl)).toString();
        if ( doc.match(/"mt_datenav group">\n<a href="([\S\s]*?)" title="einen Tag zur&uuml;ck"/) )
            var zURL = doc.match(/"mt_datenav group">\n<a href="([\S\s]*?)" title="einen Tag zur&uuml;ck"/)[1];
        if ( doc.match(/id="selectdate">\n<\/div>\n<a href="([\S\s]*?)" title="einen Tag weiter"/) )
            var wURL = doc.match(/id="selectdate">\n<\/div>\n<a href="([\S\s]*?)" title="einen Tag weiter"/)[1];
        var mDay = doc.match(/"viewdate">\n([\S\s]*?)<span class="notbelow30em">([\S\s]*?)<\/span>/);
        var vDay = mDay[1] + mDay[2];

        if ( zURL )
            page.appendItem(PREFIX + ':ndr:sendung_verpasst:' + escape(zURL), 'directory', {title: 'Einen Tag zurück'});
        if ( wURL )
            page.appendItem(PREFIX + ':ndr:sendung_verpasst:' + escape(wURL), 'directory', {title: 'Einen Tag weiter'});
		page.appendItem("", "separator", {title: vDay});

        page.entries = 0;
             doc = doc.match(/program_schedule([\S\s]*?)footer/)[1];
        var item = doc.match(/timeandplay[\S\s]*?button epgbutton/g);
        var tTime = '';
        
        if (item) {
            for (var i=0; i < item.length; i++) {
                var vUrl = item[i].match(/href="([\S\s]*?)" title/)[1];
                    time = item[i].match(/"time">([\S\s]*?)<\/strong>\n<span class="until">([\S\s]*?)\n([\S\s]*?)</);
                if (time) tTime = time[1] + ' ' + time[2] + ' ' + time[3];
                var vTitle = new showtime.RichText(coloredStr(tTime, blue) + ' - ' + item[i].match(/title="([\S\s]*?)"  >([\S\s]*?)<\/a>/)[2]);
                if (item[i].match(/"subtitle">([\S\s]*?)</))
                    var descr = item[i].match(/"subtitle">([\S\s]*?)</)[1];
                else
                    var descr = '';
                var icon = BASE_URL + item[i].match(/<img src="([\S\s]*?)"/)[1];
                var dura = item[i].match(/"L&auml;nge"><\/span>([\S\s]*?)</)[1].replace(/\n/,'');
                page.appendItem(PREFIX + ':ndr:play:' + escape(vUrl) + ':' + escape(vTitle), 'video', {
                    station:     vTitle,
                    title:       vTitle,
                    description: descr,
                    icon:        icon,
                    album_art:   icon,
                    album:       '',
                    duration:    dura,
                    //genre:       genre
                });
                page.entries++;
            };
        }
        else
            page.appendPassiveItem("file", "", {title: 'Zu diesem Datum liegen keine Programminformationen vor.'});
        page.loading = false;
    });

    // Sendungen A-Z
    plugin.addURI(PREFIX + ':ndr:sendungen_a-z', function(page) {
        var BASE_URL = 'http://www.ndr.de';
        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'NDR Mediathek - Sendungen A-Z';
        page.metadata.background = 'http://www.ndr.de/mediathek/media/mediathek239_v-contentxl.jpg';
        page.metadata.backgroundAlpha = 0.2;

        page.loading = true;
        var doc = showtime.httpReq(BASE_URL + '/mediathek/sendungen_a-z/index.html').toString();
            doc = doc.match(/<section([\S\s]*?)<\/section>/)[1];
        var item = doc.match(/href=[\S\s]*?</g);

        for (var i=0; i < item.length; i++) {
            var url   = item[i].match(/href="([\S\s]*?)"/)[1];
            var title = item[i].match(/"link_arrow">([\S\s]*?)</)[1];
            page.appendItem(PREFIX + ':ndr:sendung:' + escape(url) + ':' + escape(title), 'directory', {
                station:     title,
                title:       title
            });
        };
        page.loading = false;
    });
        
    // NDR Sendung
    plugin.addURI(PREFIX + ':ndr:sendung:(.*):(.*)', function(page, sUrl, title) {
        var BASE_URL = 'http://www.ndr.de';
        var URL      = BASE_URL + unescape(sUrl);
        title = unescape(title);

        // Sendungslogo as background
        if ( title == "45 Min" ) page.metadata.background = 'http://www.ndr.de/logo288_v-contentxl.jpg';
        if ( title == "7 Tage" ) page.metadata.background = 'http://programm.ard.de/sendungsbilder/teaser_huge/473/NDR_12810571473_Original_NDREPG.JPEG';
        if ( title == "Bettina und Bommes" ) page.metadata.background = 'http://www.ndr.de/ndr1niedersachsen/sendungen/bettinaundbommes106_v-contentxl.jpg';
        if ( title == "Bingo! - Die Umweltlotterie" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/bingo_die_umweltlotterie/logo148_v-contentxl.jpg';
        if ( title == "Bücherjournal" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/buecherjournal/logo212_v-contentxl.jpg';
        if ( title == "DAS!" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/das/logo138_v-contentxl.jpg';
        if ( title == "DAS! Wunschmenü" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/das_wunschmenue/logo391_v-contentgross.jpg';
        if ( title == "Der Tag der Norddeutschen" ) page.metadata.background = 'http://www.ndr.de/kultur/geschichte/tag_der_norddeutschen/tagdernorddeutschen105_v-contentgross.jpg';
        if ( title == "Der Tatortreiniger" ) page.metadata.background = 'http://www.ndr.de/unterhaltung/comedy/tatortreiniger103_v-contentxl.jpg';
        if ( title == "Der XXL-Ostfriese" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/der_xxl_ostfriese/xxlostfriese333_v-contentxl.jpg';
        if ( title == "Die Ernährungs-Docs" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/die-ernaehrungsdocs/logo946_v-contentgross.jpg';
        if ( title == "Die Nordreportage" ) page.metadata.background = 'http://www.ndr.de/media/nordreportage535_v-contentxl.jpg';
        if ( title == "die nordstory" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/die_nordstory/logo687_v-contentxl.jpg';
        if ( title == "Die Reportage" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/die_reportage/reportage551_v-contentxl.jpg';
        if ( title == "Expeditionen ins Tierreich" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/expeditionen_ins_tierreich/logo158_v-contentgross.jpg';
        if ( title == "extra 3" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/extra_3/logo160_v-contentxl.jpg';
        if ( title == "Gefragt - Gejagt" ) page.metadata.background = 'http://www.ndr.de/media/screenshot1331_v-contentxl.jpg';
        if ( title == "Hallo Niedersachsen" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/hallo_niedersachsen/logo313_v-contentxl.jpg';
        if ( title == "Hamburg Journal" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/hamburg_journal/logo162_v-contentxl.jpg';
        if ( title == "Hamburg Journal 18.00" ) page.metadata.background = 'http://www.ndr.de/fernsehen/programm/hhjournal4_v-contentgross.jpg';
        if ( title == "Hanseblick" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/hanseblick/logo214_v-contentxl.jpg';
        if ( title == "Inas Nacht" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/hanseblick/logo164_v-contentgross.jpg';
        if ( title == "Intensiv-Station" ) page.metadata.background = 'http://www.ndr.de/info/sendungen/intensiv-station/intensivstation335_v-contentxl.jpg';
        if ( title == "Kulturjournal" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/kulturjournal/logo166_v-contentgross.jpg';
        if ( title == "Land im Gezeitenstrom" ) page.metadata.background = 'http://www.ndr.de/media/gezeitenstrom133_v-contentxl.jpg';
        if ( title == "Landpartie - Im Norden unterwegs" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/landpartie_im_norden_unterwegs/logo170_v-contentxl.jpg';
        if ( title == "Lebensmittel-Check mit Tim Mälzer" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/lebensmittel-check_mit_tim_maelzer/logo771_v-contentgross.jpg';
        if ( title == "Lieb & Teuer" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/lieb_und_teuer/logo140_v-contentxl.jpg';
        if ( title == "Lust auf Norden" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/lust_auf_norden/logo174_v-contentxl.jpg';
        if ( title == "Länder - Menschen - Abenteuer" ) page.metadata.background = 'http://www.ndr.de/fernsehen/programm/lma124_v-contentgross.jpg';
        if ( title == "mareTV" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/mare_tv/logo176_v-contentxl.jpg';
        if ( title == "Markt" ) page.metadata.background = 'http://www.ndr.de/media/logo178_v-contentgross.jpg';
        if ( title == "Mein Nachmittag" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/mein_nachmittag/logo142_v-contentxl.jpg';
        if ( title == "Mein schönes Land TV" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/mein_schoenes_land_tv/sendungslogo103_v-contentgross.jpg';
        if ( title == "NaturNah" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/sendung22999_v-contentxl.jpg';
        if ( title == "NDR Comedy Contest" ) page.metadata.background = 'http://www.n-joy.de/entertainment/comedy/comedy_contest/comedycontest1747_v-contentgross.jpg';
        if ( title == "NDR Talk Show" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/ndr_talk_show/logo182_v-contentxl.jpg';
        if ( title == "NDR Talk Show classics" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/ndr_talk_show/logo543_v-contentxl.jpg';
        if ( title == "NDR//Aktuell" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/ndr_aktuell/logo369_v-contentxl.jpg';
        if ( title == "Neues aus Büttenwarder" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/neues_aus_buettenwarder/neues104_v-contentgross.jpg';
        if ( title == "Niedersachsen 18.00 Uhr" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/niedersachsen_1800/logo218_v-contentxl.jpg';
        if ( title == "Nordmagazin" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/nordmagazin/logo188_v-contentxl.jpg';
        if ( title == "Nordmagazin - Land und Leute" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/land_und_leute/logo168_v-contentxl.jpg';
        if ( title == "Nordseereport" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/nordseereport/logo190_v-contentxl.jpg';
        if ( title == "Nordtour" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/nordtour/logo192_v-contentxl.jpg';
        if ( title == "Offen gesagt" ) page.metadata.background = 'http://www.ndr.de/kirche/og112_v-contentxl.jpg';
        if ( title == "Ostsee Report" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/ostsee-report/logo194_v-contentxl.jpg';
        if ( title == "Panorama - die Reporter" ) page.metadata.background = 'http://daserste.ndr.de/panorama/panorama4507_v-contentxl.jpg';
        if ( title == "Panorama 3" ) page.metadata.background = 'http://daserste.ndr.de/panorama/logo683_v-contentxl.jpg';
        if ( title == "Pleiten, Pech & Pannen" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/pleiten-pech-und-pannen/sendungsbild9582_v-contentxl.jpg';
        if ( title == "plietsch." ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/plietsch/plietsch663_v-contentxl.jpg';
        if ( title == "Polettos Kochschule" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/polettos_kochschule/logo144_v-contentgross.jpg';
        if ( title == "Postillon24" ) page.metadata.background = 'http://www.ndr.de/fernsehen/postillon814_v-contentxl.jpg';
        if ( title == "Rainer Sass: So isst der Norden" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/soisstdernorden109_v-contentxl.jpg';
        if ( title == "Rote Rosen" ) page.metadata.background = 'http://www.ndr.de/fernsehen/media/roterosenlogo100_v-contentxl.jpg';
        if ( title == "Rund um den Michel" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/rund_um_den_michel/logo222_v-contentxl.jpg';
        if ( title == "Schleswig-Holstein 18:00" ) page.metadata.background = 'http://www.ndr.de/fernsehen/programm/shol2_v-contentgross.jpg';
        if ( title == "Schleswig-Holstein Magazin" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/schleswig-holstein_magazin/logo200_v-contentxl.jpg';
        if ( title == "Schönes Landleben" ) page.metadata.background = 'http://www.ndr.de/media/logoschoeneslleben101_v-contentgross.jpg';
        if ( title == "Sesamstraße" ) page.metadata.background = 'http://www.sesamstrasse.de/sesamstrasse124_v-contentgross.jpg';
        if ( title == "So ein Tag!" ) page.metadata.background = 'http://www.ndr.de/nachrichten/hamburg/filmkamera2_v-contentgross.jpg';
        if ( title == "Sportclub" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/sportclub/logo136_v-contentxl.jpg';
        if ( title == "Sturm der Liebe" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sturmderliebe100_v-contentxl.jpg';
        if ( title == "Theresas Küche - Kochen mit Freunden" ) page.metadata.background = 'http://www.ndr.de/ratgeber/kochen/theresa_kocht/theresakocht135_v-contentxl.jpg';
        if ( title == "Tietjen und Hirschhausen" ) page.metadata.background = 'http://www.ndr.de/fernsehen/tietjenundhirschhausen100_v-contentxl.jpg';
        if ( title == "Tim Mälzer kocht!" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/ndr_talk_show/maelzer100_v-contentxl.jpg';
        if ( title == "Typisch!" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/typisch563_v-contentxl.jpg';
        if ( title == "Visite" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/visite/logo204_v-contentxl.jpg';
        if ( title == "Weltbilder" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/weltbilder/weltbilderlogo100_v-contentxl.jpg';
        if ( title == "X:enius" ) page.metadata.background = 'http://www.arte.tv/papi/tvguide/images/Xenius_Logo/W940H530/Xenius_Logo.jpg';
        if ( title == "ZAPP" ) page.metadata.background = 'http://www.ndr.de/fernsehen/sendungen/zapp/logo210_v-contentgross.jpg';
        page.metadata.backgroundAlpha = 0.2;

        indexNdrVideos(page, URL, 'Sendung: ' + title);
    });
    
    function indexNdrVideos(page, url, title) {
        var BASE_URL = 'http://www.ndr.de';
        var tryToSearch = true;

        page.type = 'directory';
//        page.metadata.glwview = plugin.path + 'views/array.view';
        page.contents = 'items';
        page.metadata.logo = logo;
        page.metadata.title = 'NDR Mediathek - ' + title;

        page.entries = 0;

        function searchAndAppendVideos(doc) {
            doc = doc.match(/pagepadding([\S\s]*?)"footer"/)[1];
            var searchResults = false;
            if ( doc.match(/featuredlist searchresult/) ) {
                var item = doc.match(/icon_video[\S\s]*?\n<\/p>\n<\/div>\n<\/div>\n<\/div>/g); // for search result
                searchResults = true;
            }
            else
                var item = doc.match(/<img src="[\S\s]*?<\/div>\n<\/div>\n<\/div>\n<\/div>/g);

            if (item) {
                for (var i=0; i < item.length; i++) {
                    // Only video items
                    if (item[i].match(/icon_video/)) {
                        if ( searchResults ) {
                            var vTitle = noHtmlCode(item[i].match(/<a title="" href="([\S\s]*?)" >\n([\S\s]*?)<\/a>/)[2]);
                            var vUrl   = item[i].match(/<a title="" href="([\S\s]*?)" >/)[1];
                            var descr  = item[i].match(/<div class="teasertext">\n<p>([\S\s]*?)<\/p>/)[1];
                            var pDate  = '\n\n\nVom: ' + item[i].match(/<p class="stand">Stand:\n([\S\s]*?)\n<\/p>/)[1];
                            if (item[i].match(/<img title="" src="([\S\s]*?)">/))
                                var icon = item[i].match(/<img title="" src="([\S\s]*?)">/)[1];
                            else
                                var icon = ''; // no icon available
                            var dura = '', genre = '';
                        }
                        else {
                            var vTitle = noHtmlCode(item[i].match(/title="Zum Video: ([\S\s]*?)"/)[1]);
                            var sTitle = noHtmlCode(item[i].match(/title="([\S\s]*?)"/)[1]);
                            var vUrl   = item[i].match(/<a href="([\S\s]*?)" title/)[1];
                            if (item[i].match(/<p>\n([\S\s]*?)\n<a title=/))
                                var descr = item[i].match(/<p>\n([\S\s]*?)\n<a title=/)[1];
                            else
                                var descr = sTitle;
                            var icon   = item[i].match(/img src="([\S\s]*?)"/)[1];
                            if (!icon.match(/http/)) icon = BASE_URL + icon;
                            var dura   = item[i].match(/icon_video"><\/span>([\S\s]*?)\n</)[1];
                            if (item[i].match(/<div class="subline">([\S\s]*?)<\/div>/))
                                var pDate = '\n\n\nVom: ' + item[i].match(/<div class="subline">([\S\s]*?)<\/div>/)[1];
                            else
                                var pDate = '';
                            if (item[i].match(/<\/div>\n<div class="subline">([\S\s]*?)<\/div>/))
                                var genre = item[i].match(/<\/div>\n<div class="subline">([\S\s]*?)<\/div>/)[1];
                            else
                                var genre = '';
                        }

                        page.appendItem(PREFIX + ':ndr:play:' + escape(vUrl) + ':' + escape(vTitle), 'video', {
                            station:     vTitle,
                            title:       vTitle,
                            description: descr + pDate,
                            icon:        icon,
                            album_art:   icon,
                            album:       '',
                            duration:    dura,
                            genre:       genre
                        });
                        page.entries++;
                        if ( searchResults ) page.metadata.title = 'NDR Mediathek - ' + title + ' (' + page.entries + ' Treffer)';
                    }
                };
            }
        } // searchAndAppendVideos
        
        function loader() {
            if (!tryToSearch) return false;
            page.loading = true;
            var doc = showtime.httpReq(url).toString();

            searchAndAppendVideos(doc);
            page.loading = false;

            var next = doc.match(/title="weiter" href="([\S\s]*?)"/) || 
                       doc.match(/<li class="next">\n<a class="button iconbutton square" href="([\S\s]*?)"/);
            if (!next) return tryToSearch = false;
            url = BASE_URL + next[1];
            return true;
        }
        
        loader();
        page.paginator = loader;
    }
    
    // NDR play videolink
    plugin.addURI(PREFIX + ':ndr:play:(.*):(.*)', function(page, vUrl, title) {
        vUrl = unescape(vUrl);
        if (!vUrl.match(/http:\/\//)) vUrl = 'http://www.ndr.de' + vUrl;
        page.loading = true;
        var doc = showtime.httpReq(vUrl).toString();
        if (doc.match(/2: \{src:'([\S\s]*?)'/))
            var videoUrl = doc.match(/2: \{src:'([\S\s]*?)'/)[1];
        else
            var videoUrl = doc.match(/1: \{src:'([\S\s]*?)'/)[1];
                    
        page.loading = false;
        page.type = "video";
        page.source = "videoparams:" + showtime.JSONEncode({
            title: unescape(title),
            canonicalUrl: PREFIX + ":ndr:play:" + vUrl + ":" + title,
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
//        page.metadata.glwview = plugin.path + 'views/array.view';
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
                description: vp.videoJsonPlayer.VDE + '\n\nOnline seit: ' + json.videos[i].airdate_long,
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
//        page.metadata.glwview = plugin.path + 'views/array.view';
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
//        page.metadata.glwview = plugin.path + 'views/array.view';
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
