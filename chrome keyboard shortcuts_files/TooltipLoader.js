// Copyright 2007 Google Inc.
// All Rights Reserved.

/**
 * TooltipLoader manages the functionality around showing, loading, and hiding
 * of tooltip divs.
 *
 * @author Clarence Bruce Applegate (gromit@google.com)
 */

var XML_READY_STATE_COMPLETED = 4;
var XML_STATUS_OKAY = 200;

var LOADING_DIV_ID = 'loadingDiv';
var TOOLTIP_IFRAME_ID = 'tooltipIframe';

/**
 * Creates a TooltipLoader object.
 * @constructor
 *
 * @param baseUrl The base URL that will be used for all requests for this
 * loader.  Additional params can be passed at load-time for usages of this
 * loader.
 */
function TooltipLoader(baseUrl) {
  // Base URL.
  this.baseUrl = baseUrl;

  // Elements for which an info request has been sent but no response received.
  this.waitingForResponse = {};
  // Elements for which content has already been loaded.
  this.contentLoaded = {};
  // Elements which are currently being touched.
  this.currentElement = {};
  // Request information.
  this.xmlHttpRequest = new XMLHttpRequest();
  // CSS style.display values for elements when they are visible.
  this.displayStyles = {};

  // Delay before tooltip is displayed on loadContent call.
  this.loadTimeout = 1000;
  // Delay before tooltip is hidden on hideContent call.
  this.hideTimeout = 300;

  // z-index of div.
  this.divZIndex = 100;

  // Div to be displayed when tooltip should be visible but the data is not yet
  // loaded.
  this.setLoadingDiv(LOADING_DIV_ID);
  // iframe to be displayed behind tooltip (needed for internet explorer).
  this.setTooltipIframe(TOOLTIP_IFRAME_ID);

  // Function to clear the loaded elements.
  this.resetContentCache = function() {
    this.contentLoaded = {};
  }
}

/**
 * Function to set which div to display when results are loading to be the div
 * with ID loadingDivId.
 *
 * @param loadingDivId ID of the loading div.
 */
TooltipLoader.prototype.setLoadingDiv = function(loadingDivId) {
  this.loadingDiv = document.getElementById(loadingDivId);
}

/**
 * Function to set which iframe to place behind the tooltip to be the iframe
 * with ID tooltipIframeId.
 *
 * @param tooltipIframeId ID of the tooltip iframe.
 */
TooltipLoader.prototype.setTooltipIframe = function(tooltipIframeId) {
  this.tooltipIframe = document.getElementById(tooltipIframeId);
}

/**
 * Function to set the z-index (aka style.zIndex) for all divs in this tooltip
 * loader.  Note that the iframe behind the div will have z-index of 5 less than
 * the div.
 *
 * @param zIndex z-index of the tooltip
 */
TooltipLoader.prototype.setZIndex = function(zIndex) {
  this.divZIndex = zIndex;
}

/**
 * Function to actually fetch the information at the URL.
 *
 * @param xmlHttp XmlHttpRequest to use to fetch.
 * @param url URL from which to fetch.
 */
TooltipLoader.prototype.xmlHttpGet = function(xmlhttp, url) {
  xmlhttp.open("GET", url, true);
  xmlhttp.send(null);
}

/**
 * This takes an element on the page and repositions it relative to a
 * coordinate pair that represents the left top corner of a page element.  Note
 * that the assumption is that that "left top" page element is assumed to
 * contain the passed image, and therefore the calculation of the new position
 * incorporates the image dimensions.
 *
 * @param element Element to be repositioned.
 * @param leftTop Location of the left top corner of the page element the
 * repositioned element should be positioned relative to.
 * @param imgIcon The image that is at the location, to be taken into account in
 * the calculation of the new position.
 */
TooltipLoader.prototype.repositionTooltip = function(element, leftTop,
                                                     imgIcon) {
  var leftPos = leftTop[0] + imgIcon.offsetWidth;
  var topPos = leftTop[1] + imgIcon.offsetHeight;

  // Minimum distances we want between the tooltip and the edge of the browser
  // window.
  var minDistFromEdge = 30;

  // Get the information about elements involved in calculation of location.

  // Screen dimensions
  // Pick between not IE, IE6 Strict Mode, and other IE.
  var screenHeight =
      self.innerHeight || document.documentElement.clientHeight ||
      document.body.clientHeight;
  var screenWidth =
      self.innerWidth || document.documentElement.clientWidth ||
      document.body.clientWidth;

  // Scroll information
  var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollLeft = document.documentElement.scrollLeft ||
                   document.body.scrollLeft;

  // Tooltip dimensions
  var tipWidth = element.offsetWidth || element.clientWidth;
  var tipHeight = element.offsetHeight || element.clientHeight;

  // Document text direction
  var direction = document.documentElement.dir || document.body.dir;

  // Place tooltip.
  element.style.left = leftPos + 'px';
  // Right or left of leftTop, depending on screen real estate and text
  // direction.
  if ((direction && direction.toLowerCase()=='rtl' &&
       leftPos >= tipWidth + minDistFromEdge)
      || screenWidth <=
         (leftTop[0] + tipWidth + minDistFromEdge - scrollLeft)) {
    element.style.left = (leftPos - (tipWidth + minDistFromEdge)) + 'px';
  }

  // Above or below leftTop, depending on screen real estate.
  // Place below leftTop if there is room.
  if (screenHeight > (leftTop[1] + tipHeight + minDistFromEdge - scrollTop)) {
    element.style.top = topPos + 'px';
  // If not enough room below leftTop, place above it if there is room.
  } else if (topPos - tipHeight - scrollTop > minDistFromEdge) {
    element.style.top = (topPos - tipHeight) + 'px';
  // If not enough room above or below leftTop, place near the top.
  } else {
    element.style.top = (scrollTop + minDistFromEdge) + 'px';
    // If it's scrollable, don't extend past leftTop.
    if (element.style.overflow == 'auto' ||
        element.style.overflow == 'scroll') {
      element.style.height = (topPos - scrollTop - minDistFromEdge) + 'px';
    }
  }
}

/**
 * It is necessary to place an iframe behind the tooltip in Internet Explorer to
 * keep some of the screen elements (specifically dropdowns) from showing
 * through the tooltip.  This function does that.
 *
 * @param divElement Element to put the iframe behind.
 */
TooltipLoader.prototype.placeIframeBehindDiv = function(divElement) {
  // If the iframe can't be found, no need to try to position it.
  if (!this.tooltipIframe) {
    return;
  }

  // Make the iframe the same location and dimensions as divElement.
  this.tooltipIframe.style.left = divElement.style.left;
  this.tooltipIframe.style.top = divElement.style.top;
  this.tooltipIframe.style.width = divElement.offsetWidth ||
                                   divElement.clientWidth;
  this.tooltipIframe.style.height = divElement.offsetHeight ||
                                    divElement.clientHeight;

  // Place it behind divElement and then display it.
  this.tooltipIframe.style.zIndex = this.divZIndex - 5;
  this.tooltipIframe.style.display = this.getDisplayStyle(
      this.tooltipIframe.id);
  this.tooltipIframe.style.visibility = 'visible';
}

/**
 * Get the coordinates of the left top corner of an element with respect to the
 * window.
 *
 * @param elem Element for which to find the coordinates.
 * @return coordinates for elem.
 */
TooltipLoader.prototype.getLeftTopAbsPos = function(elem) {
  var left = 0;
  var top = 0;
  do {
    // Keep adding offset of parent until no more parent.
    left += elem.offsetLeft;
    top += elem.offsetTop;
  } while(elem = elem.offsetParent);
  return [left, top];
}

/**
 * Get the style.display value to be used for an element when it is visible.
 * Default value is 'block'.
 *
 * @param elementId ID for the element being checked.
 * @return The desired display style for the element with ID elementId.
 */
TooltipLoader.prototype.getDisplayStyle = function(elementId) {
  return this.displayStyles[elementId] || 'block';
}

/**
 * Set the style.display value to be used for an element when it is visible.
 * If not set here, the code will use 'block'.
 *
 * @param elementId ID for the element being checked.
 * @param displayStyle Value to be used for display.style for element elementId.
 */
TooltipLoader.prototype.setDisplayStyle = function(elementId, displayStyle) {
  this.displayStyles[elementId] = displayStyle;
}

/**
 * Sets the delay time (in milliseconds) to be used before displaying the
 * tooltip in the loadContent function.
 *
 * @param loadTimeout Delay time for the loadContent function.
 */
TooltipLoader.setLoadTimeout = function(loadTimeout) {
  this.loadTimeout = loadTimeout;
}

/**
 * Sets the delay time (in milliseconds) to be used before hiding the tooltip
 * in the hideContent function.
 *
 * @param hideTimeout Delay time for the hideContent function.
 */
TooltipLoader.setHideTimeout = function(hideTimeout) {
  this.hideTimeout = hideTimeout;
}

/**
 * This loads the content from the desired URL (based on the loader's base URL
 * combined with the urlParams) into element elementId and displays it on the
 * screen relative to the image iconElementName after a delay (as set by
 * setLoadTimeout; default 1 second).  This is done via delaying a call to
 * loadContentDelayed.
 *
 * @oaram urlParams Params to be appended to the base URL for loading content.
 * @oaram elementId ID of element to populate, place, and display.
 * @oaram iconElementName Name of image to be used as a reference point.
 */
TooltipLoader.prototype.loadContent = function(urlParams, elementId,
                                               iconElementName)  {
  // elementId is now the current element.
  this.currentElement[elementId] = true;
  var thisLoader = this;
  // Call loadContentDelayed (after a delay).
  window.setTimeout(
      function () {thisLoader.loadContentDelayed(urlParams, elementId,
          iconElementName);},
      this.loadTimeout);
}

/**
 * This loads the content from the desired URL (based on the loader's base URL
 * combined with the urlParams) into element elementId and displays it on the
 * screen relative to the image iconElementName.
 *
 * @oaram urlParams Params to be appended to the base URL for loading content.
 * @oaram elementId ID of element to populate, place, and display.
 * @oaram iconElementName Name of image to be used as a reference point.
 */
TooltipLoader.prototype.loadContentDelayed = function(urlParams, elementId,
                                                      iconElementName) {
  // If this element is no longer the current element, don't load it.
  if (!this.currentElement[elementId]) {
    return;
  }

  // Get the reference image and its location.
  var imgIcon = document.getElementById(iconElementName);
  var leftTop = this.getLeftTopAbsPos(imgIcon);

  // Select div to reposition.  If element elementId is already loaded, use it;
  // otherwise, use loadingDiv.
  var destDiv = this.loadingDiv;
  if (this.contentLoaded[elementId]) {
    destDiv = document.getElementById(elementId);
  } else {
    // Make sure loadingDiv can be displayed.
    if (destDiv && destDiv.style.display == 'none') {
      destDiv.style.display = this.getDisplayStyle(destDiv.id);
    }
  }

  // If element exists, reposition it and display it.
  if (destDiv) {
    this.repositionTooltip(destDiv, leftTop, imgIcon);
    destDiv.style.visibility='visible';
    this.placeIframeBehindDiv(destDiv);
  }

  // Don't reload the content if it's already loaded; if we're already
  // waiting for a response, then don't re-request it.
  if (this.contentLoaded[elementId] || this.waitingForResponse[elementId] ) {
    return;
  }

  // Set to "waiting mode."
  this.contentLoaded[elementId] = false;
  this.waitingForResponse[elementId] = true;

  // Create request.
  this.xmlHttpRequest = new XMLHttpRequest();
  var thisRequest = this;

  // Function which fetches the data for the element and displays it.
  this.xmlHttpRequest.onreadystatechange = function() {
    if (thisRequest.xmlHttpRequest.readyState == XML_READY_STATE_COMPLETED) {
      if (thisRequest.xmlHttpRequest.status == XML_STATUS_OKAY) {
        // Get the destination element.
        var element = document.getElementById(elementId);
        if (element) {
          // Set the contents of the element.
          element.innerHTML = thisRequest.xmlHttpRequest.responseText;
          thisRequest.contentLoaded[elementId] = true;
          // Sets display if needed.
          if (element.style.display == 'none') {
            element.style.display = thisRequest.getDisplayStyle(elementId);
          }
          // Position and show element; hide loadingDiv.
          element.zIndex = thisRequest.divZIndex;
          thisRequest.repositionTooltip(element, leftTop, imgIcon);
          thisRequest.loadingDiv.style.visibility='hidden';
          element.style.visibility='visible';
          thisRequest.placeIframeBehindDiv(element);
        }
        // Now loaded.
        thisRequest.waitingForResponse[elementId] = false;
      } else {
        // Not really appropo to throw an exception here.  Will later add
        // support for an (optional) "results not found" default message.
      }
    }
  }

  // Create desiered URL based on base URL and urlParams.
  var url = this.baseUrl + urlParams;
  // Load content.
  try {
    this.xmlHttpGet(this.xmlHttpRequest, url);
  } catch (ex) {
    if (document.getElementById(elementId)) {
      this.contentLoaded[elementId] = true;
    }
    // Now loaded.
    this.waitingForResponse[elementId] = false;
  }
}

/**
 * Hides element elementId after a delay (specifically, hideTimeout) by calling
 * hideContentDelayed.
 *
 * @param elementId ID for element to be hidden.
 */
TooltipLoader.prototype.hideContent = function(elementId) {
  this.currentElement[elementId] = false;
  var thisLoader = this;
  window.setTimeout(function() {thisLoader.hideContentDelayed(elementId);},
      this.hideTimeout);
}

/**
 * Hides element elementId.
 *
 * @param elementId ID for element to be hidden.
 */
TooltipLoader.prototype.hideContentDelayed = function(elementId) {
  if (this.currentElement[elementId]) {
    return;
  }
  this.tooltipIframe.style.display='none';
  this.tooltipIframe.style.visibility='hidden';
  document.getElementById(elementId).style.visibility='hidden';
  this.loadingDiv.style.visibility='hidden';
}
