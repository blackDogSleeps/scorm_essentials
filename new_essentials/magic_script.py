import os
import re
import zipfile
import json
import base64 as b64


def add_questions():
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


def pack_up():
    needed = ['imsmanifest.xml',
              'index.html',
              '404.html']
    not_needed = ['proto_quiz.js',
                  'to_lms.zip']
    z = zipfile.ZipFile('to_lms.zip', 'w')
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
    add_questions()
    rename_index()
    add_scripts_to_index()
    collect_files()
    pack_up()


if __name__ == '__main__':
    main()
