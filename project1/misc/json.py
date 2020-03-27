import requests
from requests import get

res = requests.get("https://www.goodreads.com/book/review_counts.json", params={"key": "Z7wjF1x2lc10cLvuN8HpMQ", "isbns": "9781632168146"})
print(res.json())
