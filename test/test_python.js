const originalTextPythonText1 = `from sklearn.metrics.pairwise import linear_kernel, cosine_similarity, euclidean_distances
import numpy as np
import pandas as pd
from scipy.spatial.distance import euclidean
from owapy.tools.time_it import time_it
from sklearn.feature_extraction.text import TfidfVectorizer
`

const expectedTokensTest1 = [
    "from",
    "sklearn",
    "metrics",
    "pairwise",
    "import",
    "linear_kernel",
    "cosine_similarity",
    "euclidean_distances",
    "numpy",
    "np",
    "pandas",
    "query_vector", "return", "s", "some", "str", "t", "to", "try", "use", "value", "with", "x"
]

module.exports = {
    originalTextPythonText1,
    expectedTokensTest1
};