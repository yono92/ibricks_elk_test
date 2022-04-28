const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
let router = express.Router();

const elasticsearch = require("../util/elasticClient");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "한국경제 검색" });
});

router.post("/search", async (req, res) => {
  let q = req.body.word;
  let sd = req.body.startdate;
  let fd = req.body.findate;
  console.log(q);
  console.log(sd);
  console.log(fd);
  console.log("통합검색");
  // 통합 검색 쿼리
  if (q != null && sd === "null" && fd === "null") {
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
                "reporter.ngram",
                "title.ngram",
                "title.nori",
                "content.ngram",
                "content.nori",
              ],
            },
          },
          _source: ["content", "reporter", "title", "start_dttm"],
        },
      });
      let pageInfo = 0;
      res.render("result", {
        pageInfo: pageInfo,
        data: a.hits.hits,
        q: q,
        totaldata: a,
      });
      console.log(a);
    } catch (error) {
      res.render("error");
    }
  }

  // if (q !== null && sd !== null && fd !== null) {
  //   console.log("날짜조건 검색");
  //   try {
  //     const aa = await elasticsearch.search({
  //       index: "practice_ngram_nori",
  //       body: {
  //         size: 10,
  //         from: 0,
  //         query: {
  //           bool: {
  //             must: [
  //               {
  //                 multi_match: {
  //                   query: q,
  //                   fields: [
  //                     "content.ngram",
  //                     "content.nori",
  //                     "title.ngram",
  //                     "title.nori",
  //                     "reporter.ngram",
  //                   ],
  //                 },
  //               },
  //               {
  //                 range: {
  //                   start_dttm: {
  //                     gte: sd,
  //                     lte: fd,
  //                   },
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       },
  //       _source: ["content", "title", "start_dttm", "reporter"],
  //     });
  //     let pageInfo = 0;
  //     res.render("result", {
  //       pageInfo: pageInfo,
  //       data: aa.hits.hits,
  //       q: q,
  //       totaldata: a,
  //       sd: sd,
  //       fd: fd,
  //     });
  //   } catch (error) {
  //     console.log("캐치에서 빠짐");
  //     res.render("error");
  //   }
  // } else {
  //   console.log("엘스에서 빠짐");
  //   res.render("error");
  // }
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
  } else {
    res.render("error");
  }
});

module.exports = router;
