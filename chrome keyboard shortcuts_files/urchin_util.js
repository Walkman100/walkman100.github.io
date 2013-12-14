// Copyright 2010 Google Inc. All Rights Reserved.

/**
 * @fileoverview Analytics code for help center.
 */

// analytics_async is set in urchin_util_js_include.cs
// hc_urchin and cookie_path set in js_variables.js
if (analytics_async) {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', hc_urchin]);
  _gaq.push(['_setCookiePath', cookie_path]);
} else {
  var pageTracker = _gat._getTracker(hc_urchin);
  pageTracker._setCookiePath(cookie_path);
}
var vidList = {};
var vidFirstPlayList = new Array(); //track only first time user clicks play

/**
  * Backwards-compatibility w/ urchinTracker
  *
  * @param {string} url The URL to track.
  */

function urchinTracker(url) {
  if (hc_urchin_enabled) {
    if (analytics_async) {
      _gaq.push(['_trackPageview', url]);
    } else {
      pageTracker._trackPageview(url);
    }
  }
  cookiePathCopy();
}


/**
  * General function for tracking outgoing links
  * Category is set to 'Outgoing' so that they all show up under
  * the 'Outgoing' category in Analytics
  *
  * @param {string} link The link to track.
  * @param {string} opt_url URL to get after tracking.
  */
function trackOutgoing(link, opt_url) {
  track('Outgoing', link, opt_url);
}


/**
  * General function for tracking links
  *
  * @param {string} category The category for the link (i.e., 'Left Nav').
  * @param {string} link The link to track.
  * @param {string} opt_url URL to get after tracking.
  */
function track(category, link, opt_url) {
  // hc_page_info is set in js_variables.cs.
  // hc_lang is set in js_variables.js.
  if (hc_urchin_enabled) {
    if (analytics_async) {
      _gaq.push(['_trackEvent', category, link,
          hc_page_info + ' hl=' + hc_lang]);
    }
    else {
      pageTracker._trackEvent(category, link, hc_page_info + ' hl=' + hc_lang);
    }
  }
  cookiePathCopy();

  // If URL is specified, redirect to that URL.
  if (opt_url) {
    setTimeout('window.location = "' + opt_url + '"', 100);
  }

  if (window.this_url === undefined) {
    var this_url = document.location.href;
  }
  if (this_url.indexOf('debug=eventtracking') > 1 && internal) {
    alert('category: ' + category + '\naction: ' + link + '\n' +
        'hc_page_info: ' + hc_page_info + '\n' +
        'hl: ' + hc_lang);
  }
}


/**
  * Tracking a click on the play button in an embedded YouTube video
  * Called from the YouTube player
  *
  * @param {string} trackingId The id of the video to track.
  */
function onYouTubePlayerReady(trackingId) {
  var ytplayer = document.getElementById(trackingId);
  vidFirstPlayList[trackingId] = 0;
  vidList[trackingId] = function(newState) {
    if (newState == 1 && !vidFirstPlayList[trackingId]) {
      track('Videos', trackingId);
      vidFirstPlayList[trackingId] = 1;
    }
  };
  ytplayer.addEventListener('onStateChange', 'vidList.' + trackingId);
}

/**
  * Helper function for copying Analytics cookie data to other paths
  * Call after pageTracker tracking events.
  */
function cookiePathCopy() {
  if (hc_urchin_enabled) {
    // cookiePathArray is set in urchin_util.cs.
    for (var i = 0; i < cookiePathArray.length; i++) {
      if (analytics_async) {
        _gaq.push(['_cookiePathCopy', cookiePathArray[i]]);
      }
      else {
        pageTracker._cookiePathCopy(cookiePathArray[i]);
      }
    }
  }
}
