import os
import re
import zipfile
import json
import csv
import base64 as b64


def encodeb64(string):
    return str(b64.b64encode(bytes(string, 'utf-8')))[2:-1]


def add_questions_csv():
    questions = {}
    question_m = {}
    question = {}
    answers = {}
    new_csv = open('new_questions.csv', 'w', encoding='UTF-8')
    old_csv = open('questions.csv', encoding='UTF-8')
    temp_csv = old_csv.read() + '\n,,\n'
    old_csv.close()
    new_csv.write(temp_csv)
    new_csv.close()
    file = open('new_questions.csv', encoding='UTF-8')
    y = csv.reader(file)
    count = 0
    
    for row in y:
        if row[1] == 'multi':
            question_m.update({'question_m':encodeb64(row[0])})
        elif row[1] == 'single':
            question.update({'question':encodeb64(row[0])})
        elif 'TRUE' in row[1] or 'FALSE' in row[1]:
            answers.update({encodeb64(row[0]):[encodeb64(row[1].casefold()), 
                                               encodeb64(row[2])]})
        else:
            count += 1
            temp_answers = answers.copy()
            answers.clear()
            if len(question_m) > 0:
                question_m.update({'answers':temp_answers})
                temp_question = question_m.copy()
                questions.update({'question_' + str(count):temp_question})
                question_m.clear()
            else:
                question.update({'answers':temp_answers})
                temp_question = question.copy()
                questions.update({'question_' + str(count):temp_question})
                question.clear()
    
    file.close()
    os.remove('new_questions.csv')
    new_json = json.dumps(questions, ensure_ascii=False)
    quiz = open('shared/proto_quiz.js', encoding='utf-8')
    x = quiz.read().split('//questions_here//')
    x.append(new_json)
    (x[1], x[2]) = (x[2], x[1])
    quiz.close()
    new_file = open('shared/quiz.js', 'w', encoding='utf-8')
    new_file.write(''.join(x))
    new_file.close()


def add_questions_json():
    file = open('questions.json', encoding='utf-8')
    questions = json.load(file)
    for i in questions.values():
        new_answers = {}
        for j in i.keys():
            if 'question' in j:
                i[j] = str(b64.b64encode(bytes(i[j], 'utf-8')))[2:-1]
        old_keys = i['answers'].keys()
        for key, value in i['answers'].items():
            new_key = str(b64.b64encode(bytes(key, 'utf-8')))[2:-1]
            new_value = [
                str(b64.b64encode(bytes(value[0], 'utf-8')))[2:-1],
                str(b64.b64encode(bytes(value[1], 'utf-8')))[2:-1]
            ]
            new_answers[new_key] = new_value
        i['answers'] = new_answers
    new_json = json.dumps(questions)
    quiz = open('shared/proto_quiz.js', encoding='utf-8')
    x = quiz.read().split('//questions_here//')
    x.append(new_json)
    (x[1], x[2]) = (x[2], x[1])
    quiz.close()
    new_file = open('shared/quiz.js', 'w', encoding='utf-8')
    new_file.write(''.join(x))
    new_file.close()
    file.close()


def pack_up(title):
    needed = ['imsmanifest.xml',
              'index.html',
              '404.html']
    not_needed = ['proto_quiz.js']
    z = zipfile.ZipFile(f'{title}.zip', 'w')
    for folders, subfolders, files in os.walk('.'):
        if folders != '.':
            for file in files:
                if file not in not_needed:
                    z.write(os.path.join(folders, file))
        else:
            for file in files:
                if file in needed:
                    z.write(file)
    z.close()


def collect_files():
    new_file = open('imsmanifest.xml', 'w', encoding='utf-8')
    a_file = open('manifest_template.xml', encoding='utf-8').read()
    index = open('index.html', encoding='utf-8').read()
    title = index.split('<title>')[1].split('</title>')[0]
    a_file = re.sub('CHANGE_TITLE', title, a_file)
    new_file.write(a_file)
    d = os.listdir('.')
    for i in d:
        if os.path.isdir(i):
            os.chdir(i)
            the_dir = os.path.split(os.getcwd())[1]
            if the_dir != 'shared':
                for i in os.listdir():
                    string = f'      <file href="{the_dir}/{i}"/>\n'
                    new_file.write(string)
            os.chdir('..')
    ending = '''    </resource>\n  </resources>\n</manifest>'''
    new_file.write(ending)
    new_file.close()
    pack_up(title)


def rename_index():
    directory = os.listdir()
    for i in directory:
        if 'page' in i:
            os.rename(i, 'proto_index.html')


def add_scripts_to_index():
    file = open('proto_index.html', encoding='utf-8').read()
    new_file = open('index.html', 'w', encoding='utf-8')
    my_insert = open('index_draft.html', encoding='utf-8').read()
    a = re.search('</head>', file)
    start = file[:a.start()]
    end = file[a.start():]
    new_file.write(start + my_insert + end)
    new_file.close()


def main():
    # add_questions_json()
    add_questions_csv()
    rename_index()
    add_scripts_to_index()
    collect_files()


if __name__ == '__main__':
    main()
