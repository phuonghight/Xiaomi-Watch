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

const timming = $('.timming');

class Alarm {
  constructor(id, hour, min, isActive = true, isRepeat = false, label = '') {
    this.id = id;
    this.min = min;
    this.hour = hour;
    this.isActive = isActive;
    this.isRepeat = isRepeat;
    this.label = label;
  }
}

class App {
  #listAlarm = [];

  timeDisplayNotify = 60;
  curIndex;
  curLabel = '';
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

  day = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  constructor() {
    this._getLocalStorage();

    this._handleEvents();

    this._notification();
  }

  ////////////////////////
  // Handle events
  _handleEvents() {
    insertBtn.addEventListener('click', this._displayInsertPage.bind(this));

    overlay.addEventListener('click', this._hideFixAlarm);

    overlay.addEventListener('click', this._hideInputLabelPage);

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
          section.classList.toggle('active');
          this._changeActive(section);
          this._setLocalStorage();
        }

        // hide notification page
        else if (e.target.classList.contains('close-noti')) {
          this._hideNotifiPage();
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

        // close insert page
        else if (e.target.classList.contains('close')) {
          this._hideInsertPage();
          this.curLabel = '';
        }

        // check/install insert page
        else if (e.target.classList.contains('check')) {
          this._addAlarm();
          this.curLabel = '';
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
          this.curLabel = '';
        }

        // delete alarm
        else if (e.target.classList.contains('delete-alarm')) {
          this._deleteAlarm(this.curIndex);
          this.curLabel = '';

          this._hideFixAdditionPage();
        }

        // install fix addition
        else if (e.target.classList.contains('check-fixAdditionalPage')) {
          this._installFixAddition(
            this.curIndex,
            $('.hourFixAddition').value,
            $('.minFixAddition').value,
            false
          );
          this.curLabel = '';

          this._hideFixAdditionPage();
        }

        // hide input label alarm in both insert and fix addition page
        else if (e.target.classList.contains('cancel')) {
          this._hideInputLabelPage();
        }

        // display input alarm in insert page
        else if (e.target.classList.contains('label-alarm')) {
          this._displayInputLabelPage();
        }

        // install label alarm in insert page
        else if (e.target.classList.contains('install')) {
          this._hideInputLabelPage();
          this._updateCurLabel();
        }

        // display input alarm in fix addition page
        else if (e.target.classList.contains('addition-label-alarm')) {
          this._displayInputLabelPage(this.#listAlarm[this.curIndex]);
        }

        // install label alarm in fix addition page
        else if (e.target.classList.contains('addition-install')) {
          this._hideInputLabelPage();
          this._updateCurLabel();
        }

        // repeat after 10 minutes
        else if (e.target.classList.contains('circle__repeat')) {
          alert('Tính năng này tôi chưa code :((');
        }

        // repeat option in insert page
        else if (e.target.classList.contains('repeat')) {
          alert('Tính năng này tôi chưa code :((');
        }

        // music option in insert page
        else if (e.target.classList.contains('music')) {
          alert('Tính năng này coi như không có :((');
        }
      }.bind(this)
    );

    document.addEventListener(
      'input',
      function (e) {
        if (
          e.target.classList.contains('hourFix') ||
          e.target.classList.contains('minFix')
        ) {
          this._inputOnChange('hourFix', 'minFix', $('.fix-alarm__timming'));

          $('.header__time').textContent = `${$('.hourFix').value}:${
            $('.minFix').value
          }`;
        } else if (
          e.target.classList.contains('hourFixAddition') ||
          e.target.classList.contains('minFixAddition')
        ) {
          this._inputOnChange(
            'hourFixAddition',
            'minFixAddition',
            $('.fix-addition__timming')
          );
        } else if (
          e.target.classList.contains('hourInsert') ||
          e.target.classList.contains('minInsert')
        ) {
          this._inputOnChange('hourInsert', 'minInsert', $('.timming'));
        }
      }.bind(this)
    );
  }

  ////////////////////////

  // UI with insert alarm page
  _displayInsertPage(e) {
    const html = `<div class="header">
    <i class="fa-solid fa-xmark close"></i>
    <div class="title">
        <div class="h3">Thêm báo thức</div>
        <div class="timming"></div>
    </div>
    <i class="fa-solid fa-check check"></i>
</div>
<div class="choeseTime">
    <input type="number" class="hour hourInsert" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
        value="${`${new Date().getHours()}`.padStart(2, 0)}" min="0" max="23">
    :
    <input type="number" class="min minInsert" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
        value="${`${new Date().getMinutes()}`.padStart(2, 0)}" min="0" max="59">
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
    <div class="option_item label-alarm">
        <div class="option_title">Nhãn</div>
        <div class="lable-alarm-option">
            <i class="fa-solid fa-angle-right"></i>
        </div>
    </div>
</div>
<div class="inputLabelPage hide">
            <div class="inputLabelPage__header">Thêm nhãn báo thức</div>
            <input type="text" placeholder="Nhập nhãn" id="label-alarm">
            <div class="buttons">
                <div class="label__btn cancel">Hủy</div>
                <div class="label__btn install">OK</div>
            </div>
        </div>`;

    main.classList.add('hide');
    insertAlarmPage.innerHTML = html;

    $('.timming').textContent = this._calTime(
      new Date(),
      this._creatFuture(
        new Date(),
        $('.hourInsert').value,
        $('.minInsert').value
      )
    );

    insertAlarmPage.classList.remove('hide');
  }

  _hideInsertPage() {
    insertAlarmPage.innerHTML = '';
    insertAlarmPage.classList.add('hide');
    main.classList.remove('hide');
  }

  // UI with fix addition alarm page
  _displayFixAdditionalPage(alarm) {
    const html = `<div class="header">
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
        value="${alarm.hour.padStart(2, 0)}" min="0" max="23">
    :
    <input type="number" class="min minFixAddition" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
        value="${alarm.min.padStart(2, 0)}" min="0" max="59">
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
    <div class="option_item addition-label-alarm">
        <div class="option_title">Nhãn</div>
        <div class="lable-alarm-option">
            <i class="fa-solid fa-angle-right"></i>
        </div>
    </div>
    <div class="abc">
        <div class="delete-alarm">Xóa</div>
    </div>
</div>
<div class="inputLabelPage hide">
            <div class="inputLabelPage__header">Thêm nhãn báo thức</div>
            <input type="text" placeholder="Nhập nhãn" id="label-alarm">
            <div class="buttons">
                <div class="label__btn cancel">Hủy</div>
                <div class="label__btn addition-install">OK</div>
            </div>
        </div>`;

    $('.fixAdditionalPage').innerHTML = html;
    $('.fixAdditionalPage').classList.remove('hide');

    fixAlarm.classList.add('hide');
    main.classList.add('hide');
    overlay.classList.add('hide');
  }

  _hideFixAdditionPage() {
    main.classList.remove('hide');
    $('.fixAdditionalPage').innerHTML = '';
    $('.fixAdditionalPage').classList.add('hide');
  }

  // UI with section alarm in the main UI
  _displayAlarm(alarm) {
    const active = alarm.isActive ? 'active' : '';
    const html = `<div class="section ${active}" draggable="true" data='${
      alarm.id
    }'>
        <div class="time" data-label="${alarm.label}">${alarm.hour.padStart(
      2,
      0
    )}:${alarm.min.padStart(2, 0)}</div>
        <div class="onBtn ${active}">
            <div class="circle"></div>
        </div>
    </div>`;
    listHTML.insertAdjacentHTML('beforeend', html);
  }

  // UI with fix alarm page
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
                  value="${alarm.hour.padStart(2, 0)}" min="0" max="23">
              :
              <input type="number" class="min minFix" onKeyDown="limitText(this,2);" onKeyUp="limitText(this,2);"
                  value="${alarm.min.padStart(2, 0)}" min="0" max="59">
          </div>
          <div class="fix-alarm__btns">
              <div class="fixAdditional fix-alarm__btn">Cài đặt bổ sung</div>
              <div class="fixDoneBtn fix-alarm__btn">Hoàn tất</div>
          </div>
    `;

    fixAlarm.innerHTML = html;

    fixAlarm.classList.remove('hide');
    overlay.classList.remove('hide');
  }

  _hideFixAlarm() {
    fixAlarm.classList.add('hide');
    fixAlarm.innerHTML = '';
    overlay.classList.add('hide');
  }

  // UI with notification page when in true time
  _displayNotifiPage(alarm) {
    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const day = this.day[now.getDay()];
    const html = `
    <audio class="sound" src="./bell.mp3" loop></audio>
    <div class="notification__header">
    <div class="notify-time" data-label="${alarm.label}">${alarm.hour}:${alarm.min}</div>
    <div class="date">${date} tháng ${month} ${day}</div>
</div>

<div class="circle__repeat">Báo lại sau 10 phút</div>

<div class="close-noti">Chạm để tắt</div>`;

    $('.notification').insertAdjacentHTML('afterbegin', html);
    $('.notification').classList.add('active');
    $('.sound').play();

    setTimeout(this._hideNotifiPage.bind(this), this.timeDisplayNotify * 1000);
  }

  _hideNotifiPage() {
    $('.notification').innerHTML = '';
    $('.notification').classList.remove('active');

    let sec = new Date().getSeconds(); // vi du la 10s
    setInterval(
      function () {
        sec++;
        if (sec === 59) {
          this._notification();
          return;
        }
      }.bind(this),
      1000
    );
  }

  // UI with label input handle
  _displayInputLabelPage(alarm) {
    $('.inputLabelPage').classList.remove('hide');
    overlay.classList.remove('hide');

    if (alarm) {
      this.curLabel = alarm.label;
    }
    $('#label-alarm').value = this.curLabel;
  }

  _hideInputLabelPage() {
    $('.inputLabelPage').classList.add('hide');
    overlay.classList.add('hide');
  }

  ////////////////////////
  // Logic

  _getAlarmFromId(id) {
    return this.#listAlarm.find(alarm => alarm.id === id);
  }
  // some logic
  _addAlarm(e) {
    const alarm = new Alarm(
      this.#listAlarm.length,
      $('.hourInsert').value,
      $('.minInsert').value
    );

    if (this.curLabel) {
      alarm.label = this.curLabel;
    }

    this.#listAlarm.push(alarm);
    this._setLocalStorage();

    this._hideInsertPage();
    this._updateUI();
  }

  _updateUI() {
    listHTML.innerHTML = '';

    this._sortListAlarm();

    this.#listAlarm.forEach(alarm => {
      this._displayAlarm(alarm);
    });
  }

  _sortListAlarm() {
    this.#listAlarm.sort((a, b) => {
      if (+a.hour === +b.hour) return +a.min - +b.min;
      return +a.hour - +b.hour;
    });

    this.#listAlarm.forEach((alarm, index) => (alarm.id = index));
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

  _inputOnChange(hour, min, timming) {
    this._limitValueInput($(`.${hour}`), $(`.${min}`));
    timming.textContent = this._calTime(
      new Date(),
      this._creatFuture(new Date(), +$(`.${hour}`).value, +$(`.${min}`).value)
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
    this.#listAlarm[id].isActive = true;
    if (this.curLabel) this.#listAlarm[id].label = this.curLabel;

    this._setLocalStorage();
    this._updateUI();
  }

  _limitValueInput(hour, min) {
    min.value = +min.value > +min.getAttribute('max') ? 59 : min.value;
    hour.value = +hour.value > +hour.getAttribute('max') ? 23 : hour.value;

    min.value = +min.value < +min.getAttribute('min') ? 0 : min.value;
    hour.value = +hour.value < +hour.getAttribute('min') ? 0 : hour.value;
  }

  // notification when in true time
  _checkTime(list = this.#listAlarm) {
    const trueAlarm = list.find(alarm => {
      const now = new Date();
      return (
        alarm.isActive &&
        +alarm.hour === now.getHours() &&
        +alarm.min === now.getMinutes()
      );
    });
    return trueAlarm || undefined;
  }

  _notification() {
    const interval = setInterval(
      function () {
        const trueAlarm = this._checkTime();
        if (trueAlarm) {
          if (!trueAlarm.isRepeat) {
            const id = trueAlarm.id;
            this.#listAlarm[id].isActive = false;
            this._setLocalStorage();
            this._updateUI();
          }
          this._displayNotifiPage(trueAlarm);
          clearInterval(interval);
        }
      }.bind(this),
      1000
    );
  }

  // label
  _updateCurLabel() {
    const label = $('#label-alarm').value;
    this.curLabel = label;
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

// notify update version

const message = `Đã update tính năng nhãn cho báo thức🎉⏰ (06/12/2022)
Phần âm thanh khi báo thức thì chưa fix được ở các trình duyệt cho mobile (Thực ra là không biết fix) 😅
Trong tương lai sẽ update thêm tính năng lặp lại của báo thức.🥱💪`;
setTimeout(() => {
  alert(message);
}, 1000);
