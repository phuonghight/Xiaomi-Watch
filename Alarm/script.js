'use strict';
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function limitText(limitField, limitNum) {
  if (limitField.value.length > limitNum) {
    limitField.value = limitField.value.substring(0, limitNum);
  }
}

const overlay = $('.overlay');
const fixAlarm = $('.fix-alarm');

const listHTML = $('.list');

const insertBtn = $('.insertBtn');
const main = $('.main');
const insertAlarmPage = $('.insertAlarmPage');

const closeInsert = $('.close');
const checkBtn = $('.check');

const hourInsert = $('.hourInsert');
const minInsert = $('.minInsert');

const timming = $('.timming');

class Alarm {
  id;
  min;
  hour;
  isActive;
  isRepeat;

  constructor(hour, min, isActive = true, isRepeat = false) {
    this.min = min;
    this.hour = hour;
    this.isActive = isActive;
    this.isRepeat = isRepeat;
  }
}

class App {
  #listAlarm = [];

  curIndex;
  check;

  month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  constructor() {
    this._getLocalStorage();

    this._handleEvents();
  }

  ////////////////////////
  // Handle events
  _handleEvents() {
    insertBtn.addEventListener('click', this._displayInsertPage.bind(this));

    closeInsert.addEventListener('click', this._hideInsertPage);

    checkBtn.addEventListener('click', this._addAlarm.bind(this));

    overlay.addEventListener('click', this._hideFixAlarm);

    document.addEventListener(
      'click',
      function (e) {
        // on/off button
        if (
          e.target.classList.contains('onBtn') ||
          e.target.classList.contains('circle')
        ) {
          const btnEl = e.target.closest('.onBtn');
          btnEl.classList.toggle('active');
          const section = btnEl.parentElement;
          this._changeActive(section);
          this._setLocalStorage();
        }
      }.bind(this)
    );

    // sections handle event
    listHTML.addEventListener(
      'click',
      function (e) {
        // Click in section to fix
        if (
          e.target.classList.contains('section') ||
          e.target.classList.contains('time')
        ) {
          const sectionEl = e.target.closest('.section');
          if (!sectionEl) return;
          this.curIndex = +sectionEl.getAttribute('data');
          console.log(this.#listAlarm[this.curIndex]);
          this.check = this.#listAlarm[this.curIndex].isActive;
          this._displayFixAlarm(this.#listAlarm[this.curIndex]);
        }
      }.bind(this)
    );

    document.addEventListener(
      'click',
      function (e) {
        // if click on/off button in fix alarm
        if (
          e.target.classList.contains('onFixBtn') ||
          e.target.classList.contains('FixBtn__circle')
        ) {
          const btnEl = e.target.closest('.onFixBtn');
          if (!btnEl) return;
          btnEl.classList.toggle('active');
          this.check = !this.check;
        }

        // install fix alarm
        else if (e.target.classList.contains('fixDoneBtn')) {
          const hour = $('.hourFix').value;
          const min = $('.minFix').value;
          this._changeOneAlarmInList(this.curIndex, hour, min, this.check);

          this._hideFixAlarm();
        }

        // fix additional
        else if (e.target.classList.contains('fixAdditional')) {
          // const btn = e.target.closest('.fixAdditional');
          // if (!btn) return;

          this._displayFixAdditionalPage(this.#listAlarm[this.curIndex]);
        }

        // close fix addition page
        else if (e.target.classList.contains('close-fixAdditionalPage')) {
          this._hideFixAdditionPage();
        }

        // delete alarm
        else if (e.target.classList.contains('delete-alarm')) {
          this._deleteAlarm(this.curIndex);

          this._hideFixAdditionPage();
        }

        // install fix addition
        else if (e.target.classList.contains('check-fixAdditionalPage')) {
          this._installFixAddition(
            this.curIndex,
            $('.hourFixAddition').value,
            $('.minFixAddition').value
          );

          this._hideFixAdditionPage();
        }
      }.bind(this)
    );

    $$('input').forEach(
      function (input) {
        // input.onchange = this._inputOnChange();
        input.addEventListener('change', this._inputOnChange.bind(this));
      }.bind(this)
    );

    document.addEventListener(
      'change',
      function (e) {
        if (
          e.target.classList.contains('hourFix') ||
          e.target.classList.contains('minFix')
        ) {
          $('.fix-alarm__timming').textContent = this._calTime(
            new Date(),
            this._creatFuture(
              new Date(),
              $('.hourFix').value,
              $('.minFix').value
            )
          );

          $('.header__time').textContent = `${$('.hourFix').value}:${
            $('.minFix').value
          }`;
        } else if (
          e.target.classList.contains('hourFixAddition') ||
          e.target.classList.contains('minFixAddition')
        ) {
          $('.fix-addition__timming').textContent = this._calTime(
            new Date(),
            this._creatFuture(
              new Date(),
              $('.hourFixAddition').value,
              $('.minFixAddition').value
            )
          );
        }
      }.bind(this)
    );
  }

  ////////////////////////
  // UI
  _displayInsertPage(e) {
    main.classList.add('hide');
    insertAlarmPage.classList.remove('hide');
    hourInsert.value = `${new Date().getHours()}`.padStart(2, 0);
    minInsert.value = `${new Date().getHours()}`.padStart(2, 0);
  }

  _hideInsertPage(e) {
    main.classList.remove('hide');
    insertAlarmPage.classList.add('hide');
  }

  _displayFixAdditionalPage(alarm) {
    const html = ` <div class="header">
    <i class="fa-solid fa-xmark close-fixAdditionalPage"></i>
    <div class="title">
        <div class="h3">Thêm báo thức</div>
        <div class="timming fix-addition__timming">${this._calTime(
          new Date(),
          this._creatFuture(new Date(), alarm.hour, alarm.min)
        )}</div>
    </div>
    <i class="fa-solid fa-check check-fixAdditionalPage"></i>
</div>
<div class="choeseTime">
    <input type="number" class="hour hourFixAddition" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
        value="${alarm.hour.padStart(2, 0)}">
    :
    <input type="number" class="min minFixAddition" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
        value="${alarm.min.padStart(2, 0)}">
</div>
<div class="options">
    <div class="option_item music">
        <div class="option_title">Nhạc chuông</div>
        <div class="music-option">
            <span class="suggestion">Nhạc chuông mặc định</span>
            <i class="fa-solid fa-angle-right"></i>
        </div>
    </div>
    <div class="option_item repeat">
        <div class="option_title">Lặp lại</div>
        <div class="repeat-option">
            <span class="suggestion">Một lần</span>
            <i class="fa-solid fa-angle-right"></i>
        </div>
    </div>
    <div class="option_item vibrate">
        <div class="option_title">Rung khi báo thức</div>
        <div class="onBtn">
            <div class="circle"></div>
        </div>
    </div>
    <div class="option_item delete-after-alarm">
        <div class="option_title">Xóa sau khi đã báo thức</div>
        <div class="onBtn">
            <div class="circle"></div>
        </div>
    </div>
    <div class="option_item lable-alarm">
        <div class="option_title">Nhãn</div>
        <div class="lable-alarm-option">
            <i class="fa-solid fa-angle-right"></i>
        </div>
    </div>
    <div class="abc">
        <div class="delete-alarm">Xóa</div>
    </div>
</div>`;

    $('.fixAdditionalPage').innerHTML = html;
    $('.fixAdditionalPage').classList.remove('hide');

    fixAlarm.classList.add('hide');
    main.classList.add('hide');
    overlay.style.display = 'none';
  }

  _hideFixAdditionPage() {
    main.classList.remove('hide');
    $('.fixAdditionalPage').innerHTML = '';
    $('.fixAdditionalPage').classList.add('hide');
  }

  _addAlarm(e) {
    this._hideInsertPage();

    const alarm = new Alarm(hourInsert.value, minInsert.value);
    alarm.id = this.#listAlarm.length;

    // insertAlarm(alarm);
    this.#listAlarm.push(alarm);
    this._setLocalStorage();

    this._updateUI();
  }

  _updateUI() {
    listHTML.innerHTML = '';
    this.#listAlarm.forEach(alarm => {
      this._displayAlarm(alarm);
    });
  }

  _displayAlarm(alarm) {
    const active = alarm.isActive ? 'active' : '';
    const html = `<div class="section" draggable="true" data='${alarm.id}'>
        <div class="time">${alarm.hour.padStart(2, 0)}:${alarm.min.padStart(
      2,
      0
    )}</div>
        <div class="onBtn ${active}">
            <div class="circle"></div>
        </div>
    </div>`;
    listHTML.insertAdjacentHTML('beforeend', html);
  }

  _displayFixAlarm(alarm) {
    const html = `
    <div class="header">
              <div class="header--left">
                  <div class="header__time h3">${alarm.hour.padStart(
                    2,
                    0
                  )}:${alarm.min.padStart(2, 0)}</div>
                  <div class="timming fix-alarm__timming">${this._calTime(
                    new Date(),
                    this._creatFuture(new Date(), alarm.hour, alarm.min)
                  )}</div>
              </div>
  
              <div class="onFixBtn ${alarm.isActive ? 'active' : ''}">
                  <div class="FixBtn__circle"></div>
              </div>
          </div>
          <div class="choeseTime fix-alarm__choeseTime">
              <input type="number" class="hour hourFix" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
                  value="${alarm.hour.padStart(2, 0)}">
              :
              <input type="number" class="min minFix" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
                  value="${alarm.min.padStart(2, 0)}">
          </div>
          <div class="fix-alarm__btns">
              <div class="fixAdditional fix-alarm__btn">Cài đặt bổ sung</div>
              <div class="fixDoneBtn fix-alarm__btn">Hoàn tất</div>
          </div>
    `;

    fixAlarm.innerHTML = html;

    fixAlarm.classList.remove('hide');
    overlay.style.display = 'block';
  }

  _hideFixAlarm() {
    fixAlarm.classList.add('hide');
    fixAlarm.innerHTML = '';
    overlay.style.display = 'none';
  }

  ////////////////////////
  // Logic
  _getAlarmFromId(id) {
    return this.#listAlarm.find(alarm => alarm.id === id);
  }

  _changeOneAlarmInList(index, hour, min, check) {
    // const alarm = this.#listAlarm[id];
    this.#listAlarm[index].hour = hour;
    this.#listAlarm[index].min = min;
    this.#listAlarm[index].isActive = check;

    this._setLocalStorage();
    this._updateUI();
  }

  _changeActive(section) {
    const id = +section.getAttribute('data');
    this.#listAlarm[id].isActive = !this.#listAlarm[id].isActive;
  }

  _calTime(now, future) {
    const hour = Math.floor(Math.abs(future - now) / (1000 * 60 * 60));
    const min = Math.floor(Math.abs(future - now) / (1000 * 60) - hour * 60);

    return `Báo thức sau ${hour} giờ ${min} phút`;
  }

  _isToday(now, hour, min) {
    const curHour = now.getHours();
    const curMin = now.getMinutes();

    if (curHour < hour) {
      return true;
    } else if (curHour === hour) {
      return curMin < min;
    } else return false;
  }

  _creatFuture(now, hour, min) {
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    const checkToday = this._isToday(now, hour, min);
    //Oct 25 2020 00:00:00 GMT+0700 (Giờ Đông Dương)
    return checkToday
      ? new Date(
          `${this.month[m]} ${d} ${y} ${hour}:${min}:00 GMT+0700 (Giờ Đông Dương)`
        )
      : new Date(
          `${this.month[m]} ${
            d + 1
          } ${y} ${hour}:${min}:00 GMT+0700 (Giờ Đông Dương)`
        );
  }

  _inputOnChange() {
    timming.textContent = this._calTime(
      new Date(),
      this._creatFuture(new Date(), +hourInsert.value, +minInsert.value)
    );
  }

  _deleteAlarm(id) {
    const newList = this.#listAlarm.filter(alarm => alarm.id != id);
    console.log(newList);
    this.#listAlarm = newList;

    this.#listAlarm.forEach((alarm, index) => (alarm.id = index));

    this._setLocalStorage();
    this._updateUI();
  }

  _installFixAddition(id, hour, min, isRepeat = false) {
    this.#listAlarm[id].hour = hour;
    this.#listAlarm[id].min = min;
    this.#listAlarm[id].isRepeat = isRepeat;

    this._setLocalStorage();
    this._updateUI();
  }

  ///////////////////
  // Save on Local Storage
  _setLocalStorage() {
    localStorage.setItem('listAlarm', JSON.stringify(this.#listAlarm));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('listAlarm'));

    if (!data) return;

    this.#listAlarm = data;

    this._updateUI();
  }

  reset() {
    localStorage.removeItem('listAlarm');
    location.reload();
  }

  /////////////////////////////
  get listAlarm() {
    return this.#listAlarm;
  }
}

const app = new App();

// Alarm

// notification
