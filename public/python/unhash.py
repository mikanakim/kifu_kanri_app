import copy
import game
import csv
import json
import sys
from pack_for_kifu import *

state = game.State()
replay_state = game.State()
file_path = './public/python/kifu.csv'

# csvファイル
with open(file_path) as f:
    kifu = list(csv.reader(f))
    kk = copy.deepcopy(kifu)

csv_filename = './public/python/unhash.csv'
hash_data = load_hash_data(csv_filename)
user_input = json.loads(sys.stdin.read().strip())

result = get_elements_by_hash(user_input['hash_value'], hash_data)

if isinstance(result, (list, tuple)):
    processed_input = ','.join(result)
else:
    processed_input = "Not Found"

print(json.dumps(processed_input))  # JSON形式で出力