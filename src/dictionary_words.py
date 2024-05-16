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

forbiden_words = ['fuck', 'bitch', 'penis', 'cunt', 'whore', 'hoe', 'idiot', 'morons', 'moron', 'nigger', 'nigga',
                  'vulva', 'vagina', 'boobs', 'ass', 'boob', 'fanboy', 'anger', 'jpeg', 'acct']

s5 = s4.loc[~s4.isin(forbiden_words)]
word_list = s5.values.tolist()

# TODO compare with sqlreserved words
# TODO compare with py words
with open(os.path.join(assets_path, 'reserved_words_python.json'), 'r') as f:
    reserved_words_python = json.load(f)

with open(os.path.join(assets_path, 'dict_words.json'), 'w') as f:
    json.dump(word_list, f)

