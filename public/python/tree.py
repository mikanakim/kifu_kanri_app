import copy
import game
import csv
import json
import io
import sys
from pack_for_kifu import *

state = game.State()
replay_state = game.State()
file_path = './public/python/kifu.csv'

if len(sys.argv) > 1:
    args = [x for x in sys.argv[1] if x.isdigit()]
else:
    args = ''

# csvファイル
with open(file_path) as f:
    kifu = list(csv.reader(f))
    kk = copy.deepcopy(kifu)

# unhash.csvを作成
data_dict = {generate_id_from_list(element): element for element in kk}
hash_csv_filename = './public/python/unhash.csv'
with open(hash_csv_filename, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['ID', 'Element'])  # ヘッダーを書き込む
    for id_, element in data_dict.items():
        writer.writerow([id_, element])  # 各行をCSVに書き込む

# 標準出力をキャプチャ
captured_output = io.StringIO()
sys.stdout = captured_output  # 標準出力をStringIOに差し替える

# hashデータをロード
csv_filename = './public/python/unhash.csv'  # CSVファイル名
hash_data = load_hash_data(csv_filename)  # データをロード

# メイン出力
print('「_s」「_g」は直前の分岐後、最初に石を置く方の手番を示しています(先手・後手)\n')

#解析後の棋譜treeを出力する
if args == '':
    print('latest added: Not Found\n')
else:
    args_hash = [str(i) for i in args]
    print('latest added: ', generate_id_from_list(args_hash), '\n')


y = q_notation(copy.deepcopy(kifu), copy.deepcopy(kifu), [], copy.deepcopy(kifu))
print_tree(y, kifu, hash_data, level=0)

sys.stdout = sys.__stdout__  # 標準出力を元に戻す

# キャプチャした出力を取得
result = captured_output.getvalue()

processed_input = {"result": result}
print(json.dumps(processed_input))  # JSON形式で出力