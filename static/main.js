/**
 * Created by ivan on 12/12/17.
 */

presses = [];
clicks = [];
counter = 0;
counter_span = document.getElementsByClassName('js-counter')[0];
flag = false;

textarea = document.getElementsByClassName('js-text')[0];
textarea.value = '';

description = "Данное задание направлено на исследование клавиатурного почерка. " +
    "Чтобы объяснить, что это такое, приведу аналогию с обыкновенным рукописным почерком: " +
    "у каждого человека в почерке есть какие-то определенные особенности - наклон, округлость, " +
    "степень одинаковости букв и т.д. Некоторые исследования показывают, что в наборе людьми текста " +
    "также могут быть выделены характерные признаки. Среди самых очевидных, например: скорость печати, " +
    "временная разница между нажатиями клавиш, длительность удержания клавиши, количество и тип опечаток. " +
    "Для исследования этих характеристик необходимо соответствующие данные о печатном почерке разных людей. " +
    "<br /><h2>Инструкция</h2><br />" +
    "Сейчас вы увидите страницу, разделенную на две части. В правой части страницы - поле для ввода текста." +
    "Требуется набрать текст именно руками, без копирования и вставки (они программно отключены, а " +
    "подделку набора текста всегда можно будет уличить по полученным характеристикам). Текст должен быть " +
    "осмысленным, абракадабра здесь не подойдет, поскольку характеристики набора \"кулаком по клавиатуре\"" +
    " случайны и слабо коррелируют с конкретным человеком. Чтобы не выдумывать осмысленный текст из головы, " +
    "в левой части экрана приведена случайная статья из Википедии.<br />" +
    "Требуется набрать 1500 символов. По достижении этого числа вылезет окно, куда надо будет вбить имя и фамилию, " +
    "чтобы я мог учесть вас в ведомости. После ввода имени появится сообщение со ссылками на два csv-файла: " +
    "в одном будут данные по времени нажатия клавиш, в другом - по интервалу между нажатыми клавишами.";

swal({
    html: description,
});

function submit() {
    if (flag) return;
    flag = true;
    swal({
      title: 'Введите имя:',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Отправить данные и получить csv',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      inputValidator: function(v) {return !v && 'Введите имя!'}
    }).then(function (result) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "data/", true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                down_href = JSON.parse(this.responseText).down;
                up_href = JSON.parse(this.responseText).up;
                html = function(d, u) {
                    return '<a href="'+d+'">Время нажатия клавиш</a><br /><a href="'+u+'">Время отпуска клавиш</a>';
                };
                swal({
                    title: 'Ссылка на файл с данными',
                    html: html(down_href, up_href),
                    confirmButtonText: 'Закрыть',
                })
            }
        };
        data = {name: result, data: presses, text: textarea.value, clicks: clicks};
        xhttp.send(JSON.stringify(data));
        console.log('sent');
        textarea.onkeyup = function () {return false};
        textarea.onkeydown = function () {return false};
        textarea.onclick = function () {return false};
    })
}

function onUp(e) {
    presses.push({
        key: e.which || e.keyCode,
        press: 'up',
        timestamp: Date.now(),
    });
    counter++;
    counter_span.innerHTML = counter;
    if (counter >= 10) {
        submit();
    }
}

function onDown(e) {
    presses.push({
        key: e.which || e.keyCode,
        press: 'down',
        timestamp: Date.now(),
    })
}

function onClick() {
    clicks.push({
        position: textarea.selectionStart,
        selected: textarea.selectionEnd - textarea.selectionStart,
        direction: textarea.selectionDirection,
        text_length: textarea.value.length,
        letters: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd),
        previous_letter: textarea.value[textarea.selectionStart-1] || '',
        next_letter: textarea.value[textarea.selectionEnd] || '',
        timestamp: Date.now(),
    });
    alert(clicks)
}

textarea.onkeyup = onUp;
textarea.onkeydown = onDown;
textarea.onclick = onClick();