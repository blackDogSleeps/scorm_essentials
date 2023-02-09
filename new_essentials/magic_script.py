import os
import re
import zipfile


def pack_up():
    needed = ['imsmanifest.xml',
              'index.html',
              '404.html']
    z = zipfile.ZipFile('to_lms.zip', 'w')
    for folders, subfolders, files in os.walk('.'):
        if folders != '.':
            for file in files:
                if file != 'to_lms.zip':
                    z.write(os.path.join(folders, file))
        else:
            for file in files:
                if file in needed:
                    z.write(file)
    z.close()


def collect_files():
    new_file = open('imsmanifest.xml', 'w')
    a_file = open('manifest_template.xml').read()
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
            os.rename(i, 'index.html')


def add_scripts_to_index():
    file = open('index.html', encoding='utf-8').read()
    new_file = open('new_index.html', 'w', encoding='utf-8')
    my_insert = open('index_draft.html', encoding='utf-8').read()
    a = re.search('</head>', file)
    start = file[:a.start()]
    end = file[a.start():]
    new_file.write(start + my_insert + end)
    new_file.close()

    file = open('new_index.html', encoding='utf-8').read()
    new_file = open('index.html', 'w', encoding='utf-8')
    button = open('tilda_button.html', encoding='utf-8').read()
    x = file.split('<!--END BUTTON-->')
    x[1] = x[1].lstrip('<!--END BUTTON-->')
    x.append(button)
    (x[1], x[2]) = (x[2], x[1])
    new_file.write(''.join(x))
    new_file.close()


def main():
    rename_index()
    add_scripts_to_index()
    collect_files()
    pack_up()



if __name__ == '__main__':
    main()
