const answers_container = document.getElementsByClassName('answers_container')[0];
const button = document.getElementById('sub_button');
let score = 0;
let question_objects = [];
let result = {};
let res = [];
let lastClick = 0;
let delay = 20;
let questions = //questions_here//;


class Question {
  question = '';
  answers = [];

  constructor(question, answers) {
    this.question = question;
    this.answers = answers;
  }

  set question(value) {
    this.question = value;
  }

  get question() {
    return this.question;
  }

  set answers(array){
    this.answers.push(array);
  }

  get answers() {
    return this.answers;
  }
}


function addQuestion(text, container) {
  question = document.createElement('p');
  question.className = 'question';
  question.innerText = b64_to_utf8(text);
  container.append(question);
}


function makeAnswer(text, comment, eval, answers_container) {
  result[text] = [comment, eval]
  answer = document.createElement('label');
  input = document.createElement('input');
  checkmark = document.createElement('span');

  answer.className = 'cb_container answer';
  answer.innerText = b64_to_utf8(text);

  input.type = 'radio';
  input.name = 'radio';
  checkmark.className = 'checkmark';

  answer.appendChild(input);
  answer.appendChild(checkmark);
  answer.addEventListener('click', getAnswer);
  answers_container.appendChild(answer);
}


function getAnswer() {
  if (lastClick >= (Date.now() - delay)) {
    return
  }
  lastClick = Date.now();
  res = result[utf8_to_b64(this.innerText)];
}





function sendAnswer() {
  let number = this.id.slice(7);
  let q_container = document.getElementById('question_container' + number);
  if (q_container.childElementCount > 1) {
    q_container.removeChild(q_container.children[1]);
  }
  let commentary = document.createElement('p');
  commentary.className = 'commentary';
  commentary.innerText = b64_to_utf8(res[0]);
  if (res[1] == utf8_to_b64('true')) {
    score += 1;
    commentary.style.background = 'green';
  }
  q_container.append(commentary);
  $(commentary).slideDown(800);
  this.classList.add('disabled_button');
  this.classList.remove('submit_button');
  this.disabled = true;
}


function make_quiz() {
  const question_divs = document.getElementsByClassName('uc-question');
  let many_ques = question_objects;
  for (let i = 0; i < many_ques.length; i++) {
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

    addQuestion(many_ques[i].question, question_container);

    for (x in many_ques[i].answers) {
      makeAnswer(many_ques[i].answers[x][1],
                 many_ques[i].answers[x][2],
                 many_ques[i].answers[x][0],
                 answers_container);
    }

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


function add_end_button() {
  const end_button = document.getElementsByClassName('uc-endbutton')[0]
  let link = end_button.getElementsByTagName('a')[0];
  link.removeAttribute('href');
  link.removeAttribute('target');
  link.addEventListener('click', theEnd);
}


function main() {
  let keys = Object.keys(questions);
  for (let i = 0; i < keys.length; i++) {
    question_objects.push(new Question(questions[keys[i]]['question'], questions[keys[i]]['answers']));
  }

  make_quiz();

  const buttons = document.getElementsByClassName('submit_button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', sendAnswer);
  }

  add_end_button();


}


main();
