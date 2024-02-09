import os
import glob
import json
from deepl import Translator
import re

translator = Translator('e5c8a027-fb55-8364-623c-f65a9e588af9:fx')

# 翻訳から除外する文字列を保存するJSONファイル
EXCLUSION_FILE = 'save.json'

def load_exclusions():
    with open(EXCLUSION_FILE, 'r') as file:
        return json.load(file)

def translate_file(file_path, output_directory, input_directory, exclusions):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    translated_lines = []
    for line in lines:
        if line.startswith('import') or 'const' in line or 'minecraft:' in line:
            translated_lines.append(line)
        else:
            pattern = r"'[^']*'|\"[^\"]*\"|`[^`]*`"
            matches = re.findall(pattern, line)
            for match in matches:
                if len(match[1:-1].strip()) > 0:
                    if any(exclusion in match for exclusion in exclusions):
                        continue
                    translation = translator.translate_text(match[1:-1], target_lang='JA')
                    line = line.replace(match, match[0] + translation.text + match[0])
            pattern = r"//.*$"
            match = re.search(pattern, line)
            if match:
                comment = match.group()[2:].strip()
                translation = translator.translate_text(comment, target_lang='JA')
                line = line.replace(comment, translation.text)
            translated_lines.append(line)

    output_file_path = os.path.join(output_directory, os.path.relpath(file_path, start=input_directory))
    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
    with open(output_file_path, 'w', encoding='utf-8') as file:
        file.writelines(translated_lines)

def translate_all_files_in_directory(input_directories, output_directory, recursive=False):
    exclusions = load_exclusions()
    for input_directory in input_directories:
        file_paths = glob.glob(os.path.join(input_directory, '**' if recursive else '', '*.ts'), recursive=recursive)
        for file_path in file_paths:
            if "node_modules" not in file_path:
                translate_file(file_path, output_directory, input_directory, exclusions)

multi_select = input('複数選択しますか？ (yes/no/all): ')
input_directories = [input('翻訳したいフォルダのパスを入力してください: ')] if multi_select.lower() == 'no' else input('翻訳したいフォルダのパスをカンマで区切って入力してください: ').split(',')
output_directory = os.path.expanduser('~/Downloads/翻訳済み')

if not os.path.exists(output_directory):
    os.makedirs(output_directory)

translate_all_files_in_directory(input_directories, output_directory, recursive=multi_select.lower() == 'all')
