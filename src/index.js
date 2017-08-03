'use strict';

var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:999999';
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
document.body.appendChild(canvas);
var context = canvas.getContext('2d');
var particles = [];
var particlePointer = 0;
var rendering = false;
var baseBodyMarginTop = {};
var baseBodyMarginLeft = {};

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getColor(el) {
    if (POWERMODE.colorful) {
        var u = getRandom(0, 360);
        return 'hsla(' + getRandom(u - 10, u + 10) + ', 100%, ' + getRandom(50, 80) + '%, ' + 1 + ')';
    } else {
        return window.getComputedStyle(el).color;
    }
}

function getCaret() {
    var el = document.activeElement;
    var bcr;
    if (el.tagName === 'TEXTAREA' ||
        (el.tagName === 'INPUT' && el.getAttribute('type') === 'text')) {
        var offset = require('textarea-caret-position')(el, el.selectionEnd);
        bcr = el.getBoundingClientRect();
        return {
            x: offset.left + bcr.left,
            y: offset.top + bcr.top,
            color: getColor(el)
        };
    }
    var selection = window.getSelection();
    if (selection.rangeCount) {
        var range = selection.getRangeAt(0);
        var startNode = range.startContainer;
        if (startNode.nodeType === document.TEXT_NODE) {
            startNode = startNode.parentNode;
        }
        bcr = range.getBoundingClientRect();
        return {
            x: bcr.left,
            y: bcr.top,
            color: getColor(startNode)
        };
    }
    return { x: 0, y: 0, color: 'transparent' };
}

function createParticle(x, y, color) {
    return {
        x: x,
        y: y,
        alpha: 1,
        color: color,
        velocity: {
            x: -1 + Math.random() * 2,
            y: -3.5 + Math.random() * 2
        }
    };
}

function POWERMODE() {
    { // spawn particles
        var caret = getCaret();
        var numParticles = POWERMODE.minParticles
            + Math.round(Math.random() * (POWERMODE.maxParticles - POWERMODE.minParticles));
        while (numParticles--) {
            particles[particlePointer] = createParticle(caret.x, caret.y, caret.color);
            particlePointer = (particlePointer + 1) % 500;
        }
    }
    { // shake screen
        if (POWERMODE.shake) {
            var intensity = POWERMODE.shakeIntensity + POWERMODE.shakeIntensity * 2 * Math.random();
            var x = intensity * (Math.random() > 0.5 ? -1 : 1);
            var y = intensity * (Math.random() > 0.5 ? -1 : 1);
            var style = document.body.style
            style.marginLeft = (baseBodyMarginLeft.value + x) + baseBodyMarginLeft.unit;
            style.marginTop = (baseBodyMarginTop.value + y) + baseBodyMarginTop.unit;
            setTimeout(function() {
                style.marginLeft = baseBodyMarginLeft.value + baseBodyMarginLeft.unit;
                style.marginTop = baseBodyMarginTop.value + baseBodyMarginTop.unit;
            }, 75);
        }
    }
    if(!rendering){
        requestAnimationFrame(loop);
    }
};

function loop() {
    rendering = true;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var rendered = false;
    var rect = canvas.getBoundingClientRect();
    for (var i = 0; i < particles.length; ++i) {
        var particle = particles[i];
        if (particle.alpha <= 0.1) continue;
        particle.velocity.y += 0.075;
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.alpha *= 0.96;
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fillRect(
            Math.round(particle.x - 1.5) - rect.left,
            Math.round(particle.y - 1.5) - rect.top,
            3, 3
        );
        rendered = true;
    }
    if(rendered){
        requestAnimationFrame(loop);
    }else{
        rendering = false;
    }
}

function splitValueAndUnit(measurement) {
    var r = {};
    var i = 0;
    for (; i < measurement.length; i++) {
        var c = measurement[i]
        if (c > '9' || c < '0')  {
            break;
        }
    }
    r.value = parseFloat(measurement.substring(0, i))
    r.unit =  measurement.substring(i).trim()
    return r
}

document.addEventListener("DOMContentLoaded", function(event) {
    var p = document.body;
    var style = p.currentStyle || window.getComputedStyle(p);

    baseBodyMarginLeft = splitValueAndUnit(style.marginLeft)
    baseBodyMarginTop = splitValueAndUnit(style.marginTop)

  });

POWERMODE.shake = true;
POWERMODE.shakeIntensity = 1;
POWERMODE.colorful = true;
POWERMODE.minParticles = 2;
POWERMODE.maxParticles = 8;

module.exports = POWERMODE;
