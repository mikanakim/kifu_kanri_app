import copy
import game
import hashlib
import string
import ast  # 文字列のリストをリスト型に変換するために使用
import csv

TEBAN = {0:'_s', 1:'_g', -1:'error'}

# 数字のカンマ区切りリストをIDに変換する関数
def generate_id_from_list(element):
    combined_string = ''.join(element)
    
    # MD5でハッシュ化して最初の4文字を抽出
    hash_object = hashlib.md5(combined_string.encode())
    hash_hex = hash_object.hexdigest()[:4]
    
    # 英数字のIDに変換
    chars = string.ascii_letters + string.digits  # 英大文字、英小文字、数字
    id_4_char = ''.join([chars[int(hash_hex[i], 16) % len(chars)] for i in range(4)])
    
    return id_4_char

# CSVファイルを読み込み、ハッシュIDをキー、リストを値にした辞書を作成
def load_hash_data(filename):
    hash_data = {}
    with open(filename, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            hash_id = row['ID']
            element_list = ast.literal_eval(row['Element'])
            hash_data[hash_id] = element_list
    return hash_data

# ハッシュIDに基づいてリストを検索する関数
def get_elements_by_hash(hash_id, hash_data):
    return hash_data.get(hash_id, None)  # 見つからない場合はNoneを返す

def find_subvector_id(target_subvector, lst, kk):
    for i, subvector in enumerate(lst):
        if subvector == target_subvector:
            if subvector[-1] == 'w':
                return str(generate_id_from_list(kk[i])) + '_w'
            elif subvector[-1] == 'l':
                return str(generate_id_from_list(kk[i])) + '_l'
            elif subvector[-1] == 'd':
                return str(generate_id_from_list(kk[i])) + '_d'
            else:
                return str(generate_id_from_list(kk[i]))
    return None

def check(a, b):
    if len(a) > len(b):
        return False
    count = 0
    for i in range(len(a)):
        if a[i] == b[i]:
            count += 1
    if count == len(a):
        return True
    else:
        return False

def find_subsets(element, lst):
    subsets = [x for x in lst if check(element, x)]
    for subset in subsets:
        lst.remove(subset)
    return subsets

def q_notation(lst, lst_const, win_lose, kk):# win_loseは内部処理で'w'とか'l'とかを一旦外すためのもの。初期値は空リストを入力
    result = []
    s_or_g = 0
    while lst:
        element = lst.pop(0)
        if element[-1] == 'w' or element[-1] == 'd' or element[-1] == 'l':
            win_lose.append(element[-1])
            del element[-1]
        else:
            win_lose.append(None)
        subsets = find_subsets(element, lst)
        if subsets:
            if win_lose[-1] != None:
                element.append(win_lose[-1])
                del win_lose[-1]
            else:
                del win_lose[-1]
            result.extend([find_subvector_id(element, lst_const, kk), q_notation(subsets, lst_const, win_lose, kk)])
        else:
            if win_lose[-1] != None:
                element.append(win_lose[-1])
                del win_lose[-1]
            else:
                del win_lose[-1]
            result.append(find_subvector_id(element, lst_const, kk))
    return result

def max_depth(lst):
    if not isinstance(lst, list):  # リストでない場合、深さは0を返す
        return 0
    elif len(lst) == 0:  # 空のリストの場合、深さは1を返す
        return 1
    else:
        depths = [max_depth(item) for item in lst]  # リスト内の各要素の深さを再帰的に計算
        return 1 + max(depths)  # 1を加えて最大の深さを返す

def is_one_dimensional(lst):
    for item in lst:
        if isinstance(item, list):
            return False
    return True

def print_tree(tree, kifu, hash_data, level=0,  bar=None, s_or_g=[0], prefix1="├────── ", prefix="└────── ", prefix3="|        "):
    if bar is None:
        bar = []

    for idx, item in enumerate(tree):
        is_last = (idx == len(tree) - 1)  # この階層で最後のノードか判定
        is_2nd_from_last  = (idx == len(tree) - 2)  # この階層で最後のノードか判定

        # インデント生成
        indentation = ""
        for i in range(level):
            if i in bar:
                indentation += prefix3  # 接続線を描画
            else:
                indentation += "         "

        # リストの場合（再帰的に処理）
        if isinstance(item, list):
            tmp = copy.deepcopy(tree[idx-1])
            tmp2 = get_elements_by_hash(tmp, hash_data)
            s_or_g.append(len(tmp2)%2)#直前の石の総数が偶数なら次は先手
            print_tree(item, kifu, hash_data, level + 1, bar + ([] if is_last else [level]), s_or_g)
            if len(s_or_g) > 1:
                del s_or_g[-1]
        else:
            # リストでない場合（葉ノードの処理）
            flag = s_or_g[-1]
            if is_last:
                connector = prefix
            elif is_2nd_from_last and isinstance(tree[idx+1], list):
                connector = prefix
            else:
                connector = prefix1
            print(f"{indentation}{connector}{item}{TEBAN[flag]}")


def remove_duplicates_2d_list(lst):
    flattened_list = [item for sublist in lst for item in sublist]
    unique_items = list(set(flattened_list))
    result = [[item for item in sublist if item in unique_items] for sublist in lst]
    return result

def is_two_numbers(string):
    try:
        n, m = map(int, string.split())
        return True
    except ValueError:
        return False

def extract_common_elements(x, y):
    common_elements = []
    idx = 0
    for i in range(min(len(x), len(y))):
        if x[i] == y[i]:
            common_elements.append(x[i])
            idx  =  i
        else:
            break
    return common_elements, idx

def display_state(state, lst):
    if 'w' in lst or 'd' in lst or 'l' in lst:
        for idx in range(len(lst)-1):
            state = state.next(lst[idx])
    else:
        for idx in lst:
            state = state.next(idx)

    print(state, end = '\n')

def cpp_convert(state, lst):
    lst_2 = copy.deepcopy(lst)
    if 'w' in lst or 'd' in lst or 'l' in lst:
        del lst_2[-1]
        print('size = ', len(lst_2))
        print(' '.join(map(str, lst_2)))
        print()
    else:
        print('size = ', len(lst_2))
        print(' '.join(map(str, lst)))
    if 'w' in lst or 'd' in lst or 'l' in lst:
        tmp = copy.deepcopy(lst)
        del tmp[-1]
    else:
        tmp = copy.deepcopy(lst)
    print('[', end = '')
    for i, element in enumerate(tmp):
        if i != len(tmp) - 1:
            print(state.inverse_convert(element), ', ', end = '')
        else:
            print(state.inverse_convert(element), end = '')
    print(']', end = '\n')
    print()

def replay(replay_state, lst):
    i = 0
    while i < len(lst)-1:
        print('「returnキー」: 次の手')
        print('「b」: １手戻る')
        print('「end」: 終了')
        letter = input()
        if letter == '':
            replay_state = replay_state.next(lst[i])
            print(replay_state, end = '\n')
            print('{}手目: {}\n'.format(i+1, replay_state.inverse_convert(lst[i])))
            cpp_convert(replay_state, lst[0:i+1])
            i += 1
        elif letter == 'b':
            if i == 0:
                print('1手目です。')
            else:
                replay_state = game.State()
                for k in range(i-1):
                    replay_state = replay_state.next(lst[k])
                print(replay_state, end = '\n')
                i -= 1
                cpp_convert(replay_state, lst[0:i])
                
        elif letter == 'end':
            break

def cpp_convert(state, lst):
    lst_2 = copy.deepcopy(lst)
    if 'w' in lst or 'd' in lst or 'l' in lst:
        del lst_2[-1]
        print('size = ', len(lst_2))
        print(' '.join(map(str, lst_2)))
        print()
    else:
        print('size = ', len(lst_2))
        print(' '.join(map(str, lst)))
    if 'w' in lst or 'd' in lst or 'l' in lst:
        tmp = copy.deepcopy(lst)
        del tmp[-1]
    else:
        tmp = copy.deepcopy(lst)
    print('[', end = '')
    for i, element in enumerate(tmp):
        if i != len(tmp) - 1:
            print(state.inverse_convert(element), ', ', end = '')
        else:
            print(state.inverse_convert(element), end = '')
    print(']', end = '\n')
    print()

def give_wdl(lst):
    if 'w' in lst or 'd' in lst or 'l' in lst:
        print('すでに勝敗が記載されています。', end = '\n\n')
    else:
        while True:
            print('「w/d/l」: 勝敗を入力してください')
            print('「back」: 戻る')
            letter = input()
            print()
            if letter == 'w' or letter == 'd' or letter == 'l':
                lst.append(str(letter))
                break
            elif letter == 'back':
                break

def correct_wdl(lst):
    if 'w' in lst or 'd' in lst or 'l' in lst:
        while True:
            print('「w/d/l, remove」: 修正後の勝敗を入力してください')
            print('「back」: 戻る')
            letter = input()
            print()
            if letter == 'w' or letter == 'd' or letter == 'l':
                lst[-1] = letter
                break
            elif letter == 'remove':
                del lst[-1]
                break
            elif letter == 'back':
                break
    else:
        print('勝敗が記録されていません。', end = '\n\n')