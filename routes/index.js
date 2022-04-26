const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
let router = express.Router();

const elasticsearch = require("../util/elasticClient");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/search_content", async (req, res) => {
  const q = req.body.word;
  console.log(q);
  let category = req.body.category;
  console.log(category);
  // 본문 내용으로 검색
  if (category === "content") {
    try {
      const a = await elasticsearch.search({
        index: "practice",
        body: {
          query: {
            match_phrase_prefix: {
              content: q,
            },
          },
          _source: ["content", "title", "reporter"],
        },
      });
      res.send(a.hits.hits);
      console.log(a);
    } catch (error) {
      res.status(500).json({
        message: "ELS 서버 에러",
      });
    }
  } else if (category === "giza") {
    console.log(q);
    // 기자 이름으로 검색
    try {
      const aa = await elasticsearch.search({
        index: "practice_ngram",
        body: {
          size: "100",
          query: {
            match_phrase_prefix: {
              "reporter.ngram": q,
            },
          },
          _source: ["reporter", "title", "content"],
        },
      });
      res.send(aa.hits.hits);
    } catch (error) {
      res.status(500).json({
        message: "ELS 서버 에러",
      });
    }
  } else if (category === "date") {
    console.log(req.body.startdate);
    console.log(req.body.findate);
    console.log(q);
    // 날짜 범위별 검색
    try {
      const aaa = await elasticsearch.search({
        index: "practice_ngram",
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    "content.ngram": q,
                  },
                },
                {
                  range: {
                    start_dttm: {
                      gte: req.body.startdate,
                      lte: req.body.findate,
                    },
                  },
                },
              ],
            },
          },
          _source: ["reporter", "content", "start_dttm", "title"],
        },
      });
      res.send(aaa.hits.hits);
    } catch (error) {
      res.status(500).json({
        message: "ELS 서버 에러",
      });
    }
  } else if (category === "tot") {
    // 기간 내용 기자 검색
    console.log(req.body.startdate);
    console.log(req.body.findate);
    try {
      const aaaa = await elasticsearch.search({
        index: "practice_ngram",
        body: {
          query: {
            bool: {
              must: [
                {
                  range: {
                    update_dttm: {
                      gte: req.body.startdate,
                      lte: req.body.findate,
                    },
                  },
                },
                {
                  match_phrase_prefix: {
                    "reporter.ngram": req.body.reporter,
                  },
                },
                {
                  match_phrase_prefix: {
                    content: q,
                  },
                },
              ],
            },
          },
          _source: ["reporter", "content", "start_dttm", "title"],
        },
      });
      res.send(aaaa.hits.hits);
    } catch (error) {
      res.status(500).json({
        message: "ELS 서버 에러",
      });
    }
  } else if (category === "hyung") {
    console.log("형태소분석 시작");
    // 간단한 형태소 분석 연습
    try {
      const aaaaa = await elasticsearch.search({
        body: {
          query: {
            totokenizer: ngram,
            text: q,
            explain: "true",
          },
        },
      });
      console.log(aaaaa);
      res.send(aaaaa);
      console.log("끝");
    } catch (error) {
      res.status(500).json({
        message: "ELS 서버 에러",
      });
    }
  } else if (category === "tite") {
    console.log("제목별 검색");
    console.log(q);
    try {
      const aaaaaa = await elasticsearch.search({
        index: "practice_ngram",
        body: {
          query: {
            match: {
              "title.ngram": q,
            },
          },
          _source: ["reporter", "content", "start_dttm", "title"],
        },
      });
      res.send(aaaaaa);
    } catch (error) {
      res.status(500).json({
        message: "ELS 서버 에러",
      });
    }
  }
});

module.exports = router;
