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

(function(plugin) {
    var pInfo = plugin.getDescriptor();
    var PREFIX = pInfo.id;
    var logo = plugin.path + 'mediatheken.png';
    var BASE_URL = 'http://www.di.fm';

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

    // arte page
    plugin.addURI(PREFIX + ':arte', function(page) {
        var BASE_URL = 'http://www.arte.tv';
	page.type = 'directory';
	page.metadata.glwview = plugin.path + 'views/array.view';
	page.contents = 'items';
	page.metadata.logo = logo;
	page.metadata.title = pInfo.title;
        page.loading = true;
	var doc = showtime.httpReq(BASE_URL+'/guide/de/plus7.json').toString();
        var json = showtime.JSONDecode(doc);

        for (var i in json.videos) {
            var arte_vp_url = 'http://arte.tv/papi/tvguide/videos/stream/player/D/' + json.videos[i].em + '_PLUS7-D/ALL/ALL.json';
            var vp = showtime.JSONDecode(showtime.httpReq(arte_vp_url).toString());

 	    page.appendItem(vp.videoJsonPlayer.VSR.HTTP_MP4_SQ_1.url, 'video', {
		station:     json.videos[i].title,
		title:       json.videos[i].title,
		description: vp.videoJsonPlayer.VDE + '\n\nVerfügbar bis: ' + json.videos[i].airdate_long,
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
})(this);
