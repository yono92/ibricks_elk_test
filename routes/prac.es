GET practice_ngram_nori/_search
{
  "query": {
    "match": { "content._nori": "삼성" }
  },
  "highlight": {
    "fields": {
      "content._nori": { "type": "plain" }
    }
  }
}