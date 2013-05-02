/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var HapticsCSSParser = {
  init: function() {
    HapticsCSSParser.whitespacePATTERN = /\s/g;
    HapticsCSSParser.rulePATTERN = /([.#]?\w+){([^}]+)}/ig;
    HapticsCSSParser.hapticsPATTERN = /;?haptics\s*:\s*url\(([^)]+)\)\s*;/;
    HapticsCSSParser.parse(document.documentElement);
  },
  parse: function(target) {
    switch (target.nodeName) {
      case "STYLE": {
        HapticsCSSParser.parseCSS(target.innerHTML);
        break;
      }
      case "LINK": {
        var rel = target.getAttribute("rel");
        if (rel && rel.toLowerCase() == "stylesheet") {
          var href = target.getAttribute("href");
          var xhr = new XMLHttpRequest();
          xhr.open("GET", href, false);
          xhr.send();
          HapticsCSSParser.parseCSS(xhr.responseText);
        }
        break;
      }
    } 
    for (var i = 0, n = target.children.length; i < n; i++) {
      HapticsCSSParser.parse(target.children[i]);
    }
  },
  parseCSS: function(csstext) {
    //removes whitespaces
    csstext = csstext.replace(HapticsCSSParser.whitespacePATTERN, "");
    var result = null;
    while ((result = HapticsCSSParser.rulePATTERN.exec(csstext)) !== null) {
      var selector = result[1];
      var rule = result[2];
      var haptics = HapticsCSSParser.hapticsPATTERN.exec(rule);
      if (haptics) {
        haptics = haptics[1];
        var elements = document.querySelectorAll(selector);
        for (var i = 0, n = elements.length; i < n; i++) {
          var hapticsElement = elements[i];
          hapticsElement.style.MozHaptics = haptics;
        }
      }
    }
  }
}

window.addEventListener("load", function(e) {
  HapticsCSSParser.init();
}, false);