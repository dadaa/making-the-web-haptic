/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var HapticsController = {
  init: function() {
    HapticsController.audioContext = window.webkitAudioContext ? new window.webkitAudioContext() : new AudioContext();
    HapticsController.gainControl = HapticsController.audioContext.createGain();
    HapticsController.audioBuffers = {};
    HapticsController.parse(document.body);
  },
  
  load: function(source) {
    if (HapticsController.audioBuffers[source]) {
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", source, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      HapticsController.audioContext.decodeAudioData(xhr.response, function onSuccess(result) {
        HapticsController.audioBuffers[source] = result;
      });
    };
    xhr.send();
  },
  
  enable: function(target) {
    target.addEventListener("mousemove", function(e) {
      if (!HapticsController.currentSource) {
        var currentTarget = e.target;
        var source = currentTarget.style.MozHaptics ? currentTarget.style.MozHaptics : currentTarget.getAttribute("MozHaptics");
        var context = HapticsController.audioContext;
        var gainControl = HapticsController.gainControl;
        var audioBuffer = HapticsController.audioBuffers[source];
        var source = context.createBufferSource();
        source.connect(gainControl);
        gainControl.gain.value = 1;
        gainControl.connect(context.destination);
        source.buffer = audioBuffer;
        source.loop = true;
        source.start(0);
        HapticsController.currentSource = source;
      } else {
        clearTimeout(HapticsController.timerid);
        HapticsController.timerid = setTimeout(function() {
          HapticsController.gainControl.gain.value = 0;
        }, 100);
        HapticsController.gainControl.gain.value = 1;
      }
    }, false);
    
    target.addEventListener("mouseout", function(e) {
      clearTimeout(HapticsController.timerid);
      HapticsController.gainControl.gain.value = 0;
      var self = this;
      setTimeout(function() {
        HapticsController.currentSource.stop(0);
        HapticsController.currentSource = null;
      }, 5);
    }, false);
  },
  
  parse: function(target) {
    var haptics = target.style.MozHaptics;
    target.setAttribute("MozHaptics", haptics);//for chrome.. なぜか途中からMozHapticsの値が消えてしまう。。
    if (haptics) {
      HapticsController.load(haptics);
      HapticsController.enable(target, haptics);
    }
    for (var i = 0, n = target.children.length; i < n; i++) {
      HapticsController.parse(target.children[i]);
    }
  }
}

window.addEventListener("load", function(e) {
  HapticsController.init();
}, false);