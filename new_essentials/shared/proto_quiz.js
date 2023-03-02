let questions = //questions_here//;
const answers_container = document.getElementsByClassName('answers_container')[0];
const button = document.getElementById('sub_button');
let checked = 0;
let delay = 20;
let dict = new Map();
let id_number = 0;
let score = 0;
let result = {};
let res = [];
let m_res = [];
let m_res_wrong = [];
let multi_correct_count = 0;
let checked_multi_correct = 0;
let lastClick = 0;
const question_objects = Object.values(questions);


function addQuestion(text, container) {
  question = document.createElement('p');
  question.className = 'question';
  question.innerText = b64_to_utf8(text);
  container.append(question);
}


function makeAnswer(answer_keys, answer_pack, answers_container, key) {
  for (i = 0; i < answer_keys.length; i++) {
    result[answer_keys[i]] = answer_pack[answer_keys[i]];
    answer = document.createElement('label');
    answer.className = 'cb_container answer';
    answer.innerText = b64_to_utf8(answer_keys[i]);
    input = document.createElement('input');
    checkmark = document.createElement('span');

    if (key == 'question') {
      input.type = 'radio';
      input.name = 'radio';
      checkmark.className = 'checkmark';
    }
    else {
      input.type = 'checkbox';
      input.name = 'checkbox';
      checkmark.className = 'checkmark_m';
      id_number += 1;
      checkmark.id = 'checkbox_' + id_number;
      if (b64_to_utf8(answer_pack[answer_keys[i]][0]) == 'true'){
        multi_correct_count += 1;
      }
    }

    answer.appendChild(input);
    answer.appendChild(checkmark);
    answer.addEventListener('click', getAnswer);
    answers_container.appendChild(answer);
  }
}


function getMultiAnswer(reply) {
  if (reply.getElementsByTagName('input')[0].checked) {
    if (checked > 0) {
      checked -= 1;
    }
    dict.delete(utf8_to_b64(reply.innerText));
  } else {
    checked += 1;
    dict.set(utf8_to_b64(reply.innerText),
             result[utf8_to_b64(reply.innerText)]);
  }
}


function getAnswer() {
  if (lastClick >= (Date.now() - delay)) {
    return
  }
  lastClick = Date.now();
  if (this.getElementsByTagName('span')[0].id) {
    getMultiAnswer(this);
  }
  else {
    res = result[utf8_to_b64(this.innerText)];
  }
}


function sendMultiAnswer(q_container) {
  for (let x of q_container.parentNode.getElementsByClassName('answer')) {
    let comment = document.createElement('p');
    if (x.childElementCount > 2) {
      x.removeChild(x.children[2]);
    }
    comment.className = 'commentary';
    comment.innerText = b64_to_utf8(result[utf8_to_b64(x.innerText)][1]);
    if (b64_to_utf8(result[utf8_to_b64(x.innerText)][0]) == 'true') {
      comment.style.background = 'green';
      comment.classList.add('right_answer');
    }
    x.append(comment);
  }
  for (let value of dict.values()) {
    if (b64_to_utf8(value[0]) == 'true') {
      checked_multi_correct += 1;
    }
  }
  if (checked == 0) {
    sendAnswer();
  }
  else if (checked_multi_correct == multi_correct_count && multi_correct_count == checked) {
    let right = document.getElementsByClassName('right_answer');
    for (let y of right) {
      $(y).slideDown(800);
    }
    score += 1;
  }
  else {
    let comment = q_container.parentNode.getElementsByClassName('commentary');
    $(comment).slideDown(800);
  }
}


function sendSingleAnswer(commentary, q_container) {
  if (q_container.childElementCount > 1) {
    q_container.removeChild(q_container.children[1]);
  }

  commentary.innerText = b64_to_utf8(res[1]);
  if (res[0] == utf8_to_b64('true')) {
    score += 1;
    commentary.style.background = 'green';
  }
  return commentary;
}


function sendAnswer() {
  let number = this.id.slice(7);
  let q_container = document.getElementById('question_container' + number);
  let commentary = document.createElement('p');
  commentary.className = 'commentary';
  if ('multi' == this.classList[1]) {
    sendMultiAnswer(q_container);
  }
  else {
    sendSingleAnswer(commentary, q_container);
    q_container.append(commentary);
  }
  $(commentary).slideDown(800);
  this.classList.add('disabled_button');
  this.classList.remove('submit_button');
  this.disabled = true;
}


function make_quiz() {
  const question_divs = document.getElementsByClassName('uc-question');
  for (let i = 0; i < question_objects.length; i++) {
    let key = Object.keys(question_objects[i])[0];
    let twidth = document.createElement('div');
    let quiz = document.createElement('div');
    let question_container = document.createElement('div');
    let answers_container = document.createElement('div');
    let button_container = document.createElement('div');
    let button = document.createElement('button');

    twidth.classList.add('t-width', 't-width_100');
    quiz.classList.add('quiz', 'quiz_container_mobile');
    quiz.id = 'quiz_' + (i + 1);
    question_container.classList.add('question_container');
    question_container.id = 'question_container' + (i + 1);
    answers_container.classList.add('answers_container');
    button_container.classList.add('button_container');
    button.classList.add('submit_button');
    button.innerText = 'Ответить';
    button.id = 'button_' + (i + 1);


    if (key == 'question') {
      addQuestion(question_objects[i]['question'],
                  question_container);
    }
    else {
      addQuestion(question_objects[i]['question_m'],
                  question_container);
      button.classList.add('multi');
    }


    makeAnswer(Object.keys(question_objects[i].answers),
               question_objects[i].answers,
               answers_container,
               key)


    button_container.append(button);
    quiz.append(question_container);
    quiz.append(answers_container);
    quiz.append(button_container);
    twidth.append(quiz);
    question_divs[i].innerHTML = "";
    question_divs[i].append(twidth);
  }
}


function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}


function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}


function addEndButton() {
  const end_button = document.getElementsByClassName('uc-endbutton')[0];
  let link = end_button.getElementsByTagName('a')[0];
  link.removeAttribute('href');
  link.removeAttribute('target');
  link.addEventListener('click', theEnd);
}


function addSubmitButton() {
  const buttons = document.getElementsByClassName('submit_button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', sendAnswer);
  }
}


function main() {
  make_quiz();
  addSubmitButton();
  addEndButton();

}


main();
