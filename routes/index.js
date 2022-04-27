const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
let router = express.Router();

const elasticsearch = require("../util/elasticClient");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/search", async (req, res) => {
  const q = req.body.word;
  console.log(q);
  let category = req.body.category;
  console.log(category);
  // 본문 내용으로 검색
  if (category === "content") {
    try {
      const a = await elasticsearch.search({
        index: "practice_ngram_nori",
        body: {
          from: 0,
          size: 10,
          query: {
            multi_match: {
              query: q,
              fields: [
                "content.nori",
                "content.ngram",
                "reporter.ngram",
                "title.nori",
                "title.ngram",
              ],
            },
          },
          _source: ["content", "title", "reporter"],
        },
      });

      console.log(jsonstr);
      let pageInfo = 0;
      res.render("result", {
        pageInfo: pageInfo,
        data: a.hits.hits,
        q: q,
        category: category,
        totaldata: a,
      });
      // res.send(a.hits.hits);
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
        index: "practice_ngram_nori",
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
      // res.send(aa.hits.hits);
      res.render("result", { data: aa.hits.hits });
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
        index: "practice_ngram_nori",
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    "content.nori": q,
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
      // res.send(aaa.hits.hits);
      res.render("result", { data: aaa.hits.hits });
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
      res.render("result", { data: aaaa.hits.hits });
      // res.send(aaaa)
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
      res.render("result", { data: aaaaa.hits.hits });
      // res.send(aaaaa);
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
        index: "practice_ngram_nori",
        body: {
          query: {
            match: {
              "title.nori": q,
            },
          },
          _source: ["reporter", "content", "title"],
        },
      });
      // res.send(aaaaaa);
      res.render("result", { data: aaaaaa.hits.hits });
    } catch (error) {
      res.status(500).json({
        message: "ELS 서버 에러",
      });
    }
  }
});

router.get("/search", async (req, res) => {
  let paramdata = req.query;
  if (paramdata.category === "content") {
    const a = await elasticsearch.search({
      index: "practice_ngram_nori",
      body: {
        from: paramdata.pageInfo,
        size: 10,
        query: {
          multi_match: {
            query: paramdata.q,
            fields: [
              "content.nori",
              "content.ngram",
              "reporter.ngram",
              "title.nori",
              "title.ngram",
            ],
          },
        },
        _source: ["content", "title", "reporter"],
      },
    });
    res.render("result", {
      pageInfo: paramdata.pageInfo,
      data: a.hits.hits,
      totaldata: a,
      category: paramdata.category,
      q: paramdata.q,
    });
  }
});

module.exports = router;
