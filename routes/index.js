const express = require("express");
const req = require("express/lib/request");
const { json } = require("express/lib/response");
const res = require("express/lib/response");
let router = express.Router();

const elasticsearch = require("../util/elasticClient");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "한국경제 검색" });
});

router.post("/search", async (req, res) => {
  // 바디에서 받은 검색어
  const q = req.body.word;
  //바디에서 받은 시작일
  // const sd = req.body.startdate;
  //바디에서 받은 종료일
  // const fd = req.body.findate;
  // 검색어 로그
  console.log(q);
  // console.log(sd);
  // console.log(fd);
  // 통합 검색 시작
  console.log("통합 검색");
  try {
    const a = await elasticsearch.search({
      index: "practice_ngram_nori",
      body: {
        size: 10,
        from: 0,
        query: {
          multi_match: {
            query: q,
            fields: [
              "content.ngram",
              "content.nori",
              "title.ngram",
              "title.nori",
              "reporter.ngram",
            ],
          },
        },
        _source: ["reporter", "content", "title", "start_dttm"],
      },
    });
    console.log(a);
    console.log(a.hits.hits);
    let pageInfo = 0;
    res.render("result", {
      pageInfo: pageInfo,
      data: a.hits.hits,
      q: q,
      totaldata: a,
    });
  } catch (error) {
    res.render("error");
  }
});

router.get("/search", async (req, res) => {
  let paramdata = req.query;
  const aa = await elasticsearch.search({
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
      _source: ["content", "title", "reporter", "start_dttm"],
    },
  });
  res.render("result", {
    pageInfo: paramdata.pageInfo,
    data: aa.hits.hits,
    totaldata: aa,
    q: paramdata.q,
  });
});

module.exports = router;
