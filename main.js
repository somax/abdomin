const $log = document.querySelector('#log');
const $info = document.querySelector('#info');
const $time = document.querySelector('#time');
const $range = document.querySelector('#range');
const $rangeValue = document.querySelector('#rangeValue');

var noSleep = new NoSleep();
var synth = window.speechSynthesis;

//   倾斜阈值
const abdomen = {
    _range: null,
    set range(v) {
        this._range = v;
        $range.value = v;
        $rangeValue.innerHTML = v;
    },
    get range() {
        return this._range;
    }
}
function rangeChange(el) {
    console.log(el.value)
    abdomen.range = el.value;
}

abdomen.range = 90

// 震动API侦测
var vibrateSupport = "vibrate" in navigator
if (vibrateSupport) { //兼容不同的浏览器  
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;


} else {
    $info.innerHTML = '当前浏览器不支持手机震动API'
}


const res = {};
const keys = {
    orientation: ["alpha", "beta", "gamma"],
    devicemotion: ["accelerationIncludingGravity", "acceleration", "rotationRate", "interval"]
}

function log(keysId) {
    const _keys = keys[keysId];
    return function (event) {
        const v = getV(_keys, event);
        res[keysId] = v;
    }    
}

function show() {
    $log.innerHTML = JSON.stringify(res, null, 2);

    watch();
}

function watch() {
    if (res.orientation && res.orientation.beta) {
        if (+res.orientation.beta > abdomen.range) {
            if (vibrateSupport) {
                navigator.vibrate(100);
            }
            setStatus(' 收腹！')
        } else {
            setStatus('很好，请保持！')
        }
    }
}

function setStatus(v) {
    if ($info.innerHTML != v) {
        $info.innerHTML = v
        synth.speak(new SpeechSynthesisUtterance(v))
    }
}


function start() {

    window.addEventListener('deviceorientation', log('orientation'), false); //方向感应器  

    window.addEventListener('devicemotion', log('devicemotion'), true); //重力加速感应器 for iphone, android 

    setInterval(show, 200)

    // noSleep.enable();
}



function enableNoSleep() {
    noSleep.enable();
    document.removeEventListener('click', enableNoSleep, false);
}

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
document.addEventListener('click', enableNoSleep, false);



function getV(keys, event) {
    const o = {};
    keys.forEach(k => {

        o[k] = event[k].toFixed ? event[k].toFixed(2) : event[k];

    })
    return o
}



