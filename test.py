import os
import glob
from deepl import Translator
import shutil
import re

# DeepL APIキーを設定します
DEEPL_API_KEY = 'e5c8a027-fb55-8364-623c-f65a9e588af9:fx'
translator = Translator(DEEPL_API_KEY)

def translate_file(file_path, output_directory, input_directory):
    print(f"Translating file: {file_path}")
    # ファイルを開き、内容を読み込む
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    # 各行を翻訳する
    translated_lines = []
    for line in lines:
        # import文、constが含まれる行、minecraft:から始まる行は翻訳しない
        if line.startswith('import') or 'const' in line or 'minecraft:' in line:
            translated_lines.append(line)
        else:
            # 文字列リテラル（'...'、"..."、`...`）を見つけるための正規表現パターン
            pattern = r"'[^']*'|\"[^\"]*\"|`[^`]*`"
            matches = re.findall(pattern, line)
            for match in matches:
                # マッチした文字列リテラルを翻訳する
                if len(match[1:-1].strip()) > 0:  # 空でないことを確認する
                    # \n, §, ${member.name}, ${player.name}, texturesを含む文字列は翻訳しない
                    if '\\n' in match or '§' in match or '${member.name}' in match or '${player.name}' in match or 'textures' in match:
                        continue
                    translation = translator.translate_text(match[1:-1], target_lang='JA')
                    translated_line = translation.text  # TextResultオブジェクトから文字列を取り出す
                    # 翻訳した文字列リテラルで元のものを置き換える
                    line = line.replace(match, match[0] + translated_line + match[0])
            # コメント行も翻訳する
            pattern = r"//.*$"
            match = re.search(pattern, line)
            if match:
                comment = match.group()[2:].strip()
                translation = translator.translate_text(comment, target_lang='JA')
                translated_comment = translation.text  # TextResultオブジェクトから文字列を取り出す
                line = line.replace(comment, translated_comment)
            translated_lines.append(line)

    # 翻訳した内容を新しいファイルに書き込む
    relative_path = os.path.relpath(file_path, start=input_directory)
    output_file_path = os.path.join(output_directory, relative_path)
    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
    with open(output_file_path, 'w', encoding='utf-8') as file:
        file.writelines(translated_lines)

def translate_all_files_in_directory(input_directories, output_directory, recursive=False):
    for input_directory in input_directories:
        # 指定したディレクトリ内のすべての.tsファイルを見つける
        file_paths = glob.glob(os.path.join(input_directory, '**' if recursive else '', '*.ts'), recursive=recursive)

        # 各ファイルを翻訳する
        for file_path in file_paths:
            if "node_modules" not in file_path:  # node_modulesフォルダは翻訳しない
                translate_file(file_path, output_directory, input_directory)

# メニュー画面を表示し、ユーザーから入力を受け取る
multi_select = input('複数選択しますか？ (yes/no/all): ')
if multi_select.lower() == 'yes':
    input_directories = input('翻訳したいフォルダのパスをカンマで区切って入力してください: ').split(',')
elif multi_select.lower() == 'all':
    translate_all_folders = input('フォルダ内のすべてのファイルを翻訳しますか？ (yes/no): ')
    if translate_all_folders.lower() == 'yes':
        input_directories = [input('翻訳するフォルダを指定してください: ')]
    else:
        print('翻訳を終了します')
else:
    input_directories = [input('翻訳したいフォルダのパスを入力してください: ')]

output_directory = os.path.expanduser('~/Downloads/翻訳済み')

# 出力ディレクトリが存在しない場合は作成する
if not os.path.exists(output_directory):
    os.makedirs(output_directory)

print('翻訳を実行します')
# ファイルの翻訳を開始する
translate_all_files_in_directory(input_directories, output_directory, recursive=multi_select.lower() == 'all')
print('完了しました')
