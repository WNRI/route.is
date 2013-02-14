/*
# This file is part of the Waymarked Trails Map Project
# Copyright (C) 2011-2012 Sarah Hoffmann
#
# This is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
#
# Functions for search.
*/

var searchcount = 0; //query serialisation
/* Start a new search */

$(function(){
  console.log($);
  $('#searchform').submit(function(e){
    console.log('');
    searchTerm( $('#searchterminput').val() );
    e.preventDefault();
    return false;
  });
});

function searchTerm(word) {
    word = $.trim(word);
    if (word != '') {
        if (isNaN(Number(word))) {
            closeSidebar();
            $('.sbcontent').addClass('invisible');
            $('#searchview').removeClass('invisible');
            $('.sbloading').removeClass('invisible');
            $('.searchcontent').html('');
            $('.sidebarsel').addClass('invisible');
            $('.sidebar').removeClass('invisible');
            $('#searchterm').html(word);
            routeSearchTerm(word, 10);
            // nominatim search
            var surl = searchurl + 'nominatim';
            surl += '?term=' + encodeURIComponent(word);
            surl += '&maxresults=10';
            searchcount++;
            var sid = searchcount;
            //alert('searchTerm');
            $.ajax({
              url: surl,
              async: true,
              success: function (data) {
                //alert('searchTerm success');
                if (searchcount == sid) {
                  $('#psearchloader').addClass('invisible');
                  $('#psearchcontent').html(jQuery("<div>").append(data).find('.mainpage'));
                }
              }
            });
            // $.get(surl, function (data) {
            //             if (searchcount == sid) {
            //               $('#psearchloader').addClass('invisible');
            //               $('#psearchcontent').html(jQuery("<div>").append(data).find('.mainpage'));
            //             }
            //            }
            //        );
        } else {
            document.location.href = basemapurl + 'relation/' + word;
        }
    }
    
    return false;
};

// // Prevent page refreshing on mobile devices
// $(function(){
//   $('.searchbutton').on('click', function(e){
//     if (e){
//       e.preventDefault();
//       alert('e prevented');
//     };
//   });
// });

/* (re)initiate route search
   Also called when 'more results' is clicked.
 */
var routesearchcount = 0;
function routeSearchTerm(word, numresults) {
    // route search
    $('#rsearchloader').removeClass('invisible');
    var surl = searchurl + '?term=' + encodeURIComponent(word);
    surl += '&maxresults=' + numresults;
    surl += '&moreresults=' + (numresults+10);
    routesearchcount++;
    var sid = routesearchcount;
    $.get(surl, function (data) {
                if (routesearchcount == sid) {
                  $('#rsearchloader').addClass('invisible');
                  $('#rsearchcontent').html(jQuery("<div>").append(data).find('.mainpage'));
                }
               }
           );
}    


/* load and show route details after search
   Similar to showing route details in the route window
   but allows to return to search results and zooms in on route.
 */
function showSearchInfo(osmid, xmin, ymin, xmax, ymax) {
    $('#routeinfoloader').removeClass('invisible');
    $('#routeinfocontent').html('');
    $('#routeinfo .backlink').addClass('invisible');
    $('#searchbacklink').removeClass('invisible');
    $('.sbcontent').addClass('invisible');
    $('#routeinfo').removeClass('invisible');
    $('#routeinfocontent').load(routeinfo_baseurl + osmid + 
                              '/info .routewin',
                              function () { $('#routeinfoloader').addClass('invisible'); }
                              );
    routeLayer.removeAllFeatures();
    var styleloader = new OpenLayers.Protocol.HTTP({
                url: routeinfo_baseurl + osmid + '/json',
                format: new OpenLayers.Format.GeoJSON(),
                callback: function (response) {
                     routeLayer.style = routeLayer.styleMap.styles.single.defaultStyle;
                     routeLayer.addFeatures(response.features);
                      },
                scope: this
                });
    styleloader.read();
    
    // zoom to route
    var bnds = new OpenLayers.Bounds(xmin, ymin, xmax, ymax);
    map.zoomToExtent(bnds);

}

/* return to search result after inspecting route details */
function showSearchResults() {
     $('#routeinfo').addClass('invisible');
     $('#searchview').removeClass('invisible');
}
