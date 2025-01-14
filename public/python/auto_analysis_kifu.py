import os
import csv
import sys
import copy
import json
import game
from pack_for_kifu import *

state = game.State()
replay_state = game.State()
file_path = './public/python/kifu.csv'

# 引数の設定
# 標準入力から受け取ったJSONデータを読み込む
input_data = sys.stdin.read()

# JSONデータをパース
args = json.loads(input_data)['slist']

# argsをコピー
args_copy = copy.deepcopy(args)

# argsをint化
args = [int(args[i]) for i in range(len(args)-1)]
args.append(args_copy[-1])
if isinstance(args[-1], str) and args[-1].isdigit():
    args[-1] = int(args[-1])

# 最後の要素が文字列で、数字であれば整数に変換
if isinstance(args[-1], str) and args[-1].isdigit():
    args[-1] = int(args[-1])

# csvファイルを読み込み
with open(file_path) as f:
    kifu = list(csv.reader(f))
    kk = copy.deepcopy(kifu)

# csvファイルをint化
for i in range(len(kifu)):
    # リストの要素を数値化（最終要素を除く）
    kifu[i] = [int(kifu[i][v]) for v in range(len(kifu[i]) - 1)]
    kifu[i].append(kk[i][-1])    
    # リストの最後の要素をチェックして整数化
    if kifu[i] and isinstance(kifu[i][-1], str) and kifu[i][-1].isdigit():
        kifu[i][-1] = int(kifu[i][-1])

new = []
visited = set()

def kifu_analysis(aa, nn):
    global new, kifu, visited
    if len(kifu) == 0:
        new.append(aa)
        visited.add(tuple(aa))
    
    if tuple(aa) in visited:
        return
    
    visited.add(tuple(aa))
    for i in range(nn):
        common_elements, idx = extract_common_elements(aa, kifu[nn-1-i])
        if len(common_elements) != 0: # 共通項がある
            if aa not in new or aa not in kifu:
                if aa not in new:
                    new.append(aa)
            if common_elements not in new or common_elements not in kifu:
                if common_elements not in new:
                    new.append(common_elements)
                kifu_analysis(common_elements, nn-1)
            else:
                return
        else:# 共通項がない場合
            if aa not in new or aa not in kifu:
                if aa not in new:
                    new.append(aa)
            return

def save_kifu(new_kifu):
    global kifu
    if len(new_kifu) > 0:
        new_list = copy.deepcopy(new_kifu)
        if 'w' in new_kifu or 'd' in new_kifu or 'l' in new_kifu:
            del new_list[-1]
        check_kifu = []
        for i, sublist in enumerate(copy.deepcopy(kifu)):
            if 'w' in sublist or 'd' in sublist or 'l' in sublist:
                del sublist[-1]
                check_kifu.append(sublist)
            else:
                check_kifu.append(sublist)
        # 重複してなければ追加
        if new_list not in check_kifu:
            kifu.append(new_kifu)
            kifu = sorted(kifu, key=len)
    
    with open(file_path, 'w') as f:
        writer = csv.writer(f)
        writer.writerows(kifu)

# 実行
kifu_analysis(args, len(kifu))
for i in range(len(new)):
    save_kifu(new[i])

hikisu = " ".join(map(str, args))
os.system(f'python3 ./public/python/tree.py "{hikisu}"')