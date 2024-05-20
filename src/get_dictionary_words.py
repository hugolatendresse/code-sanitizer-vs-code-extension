# Data comes from https://www.kaggle.com/datasets/rtatman/english-word-frequency?resource=download
import json

import pandas as pd
import os
assets_path = os.path.join("..","assets")
df = pd.read_csv(os.path.join(assets_path,"unigram_freq.csv"))

max_freq = 8*10**6
word_count = 10**4
max_word_length = 6
min_word_length = 4

s2 = df.loc[df['count'] < max_freq, "word"]
s3 = s2[(s2.str.len() <= 6) & (s2.str.len() >= 4)]
s4 = s3[:word_count]

forbidden_words = ['fuck', 'bitch', 'cunt', 'whore', 'hoe', 'shit', 'idiot', 'morons', 'moron', 'nigger', 'nigga',
                  'vulva', 'vagina', 'boobs', 'ass', 'boob', 'penis', 'cock', 'dick', 'fanboy', 'anger', 'jpeg', 'acct',
                   'laden', "granny", "pork"]

s5 = s4.loc[~s4.isin(forbidden_words)]
word_list = s5.values.tolist()

with open(os.path.join(assets_path, 'reserved_words_python.json'), 'r') as f:
    reserved_words_python = json.load(f)

with open(os.path.join(assets_path, 'reserved_words_sql_upper.json'), 'r') as f:
    reserved_words_sql_upper = json.load(f)

all_reserved_words = reserved_words_python + reserved_words_sql_upper

word_list_upper = [x.upper() for x in word_list]

for reserved_w in all_reserved_words:
    assert reserved_w.upper not in word_list_upper, f"{reserved_w} is in the word_list!"

with open(os.path.join(assets_path, 'dict_words.json'), 'w') as f:
    json.dump(word_list, f)
