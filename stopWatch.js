'use strict';
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const time = $('#time');
// const min = $('.min');
// const sec = $('.sec');
// const milisec = $('.milisec');
const flag = $('.flag');
const reset = $('.reset');
const start = $('.start');

let min = 0;
let sec = 0;
let milisec = 0;
let timming;
let isRunning = false;
let isReset = false;
let indexFlag = 0;

function timer() {
  milisec++;
  if (milisec === 100) {
    sec++;
    milisec = 0;
  }
  if (sec === 60) {
    min++;
    sec = 0;
  }
  displayTime();
}

function displayTime() {
  time.textContent = `${min < 10 ? `0${min}` : min}:${
    sec < 10 ? `0${sec}` : sec
  }.${milisec < 10 ? `0${milisec}` : milisec}`;
}

start.addEventListener('click', function () {
  if (isRunning === false) {
    isRunning = true;
    timming = setInterval(timer, 10);
    start.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    reset.classList.remove('hide');
    reset.innerHTML = '<i class="fa-solid fa-flag"></i>';
  } else {
    isRunning = false;
    clearInterval(timming);
    start.innerHTML = '<i class="fa-solid fa-play"></i>';
    reset.innerHTML = '<i class="fa-solid fa-square"></i>';
  }
});

function flagTime() {
  const html = `
    <div class="line">
            <div class="flag-index">
                <i class="fa-solid fa-flag"></i>
                <span class="index">${
                  ++indexFlag > 9 ? indexFlag : `0${indexFlag}`
                }</span>
            </div>
            <div class="flag-time">${min < 10 ? `0${min}` : min}:${
    sec < 10 ? `0${sec}` : sec
  }.${milisec < 10 ? `0${milisec}` : milisec}</div>
        </div>`;

  flag.insertAdjacentHTML('afterbegin', html);
  time.style.height = '30vh';
}

function resetTime() {
  milisec = min = sec = indexFlag = 0;
  isRunning = false;
  timming = null;
  displayTime();

  flag.textContent = '';
  reset.classList.add('hide');
  time.style.height = '50vh';
}

reset.addEventListener('click', function () {
  if (isRunning) {
    flagTime();
  } else {
    resetTime();
  }
});
