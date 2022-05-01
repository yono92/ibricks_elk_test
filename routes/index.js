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
  let q = req.body.word;
  console.log(q);

  // 통합 검색 시작
  console.log("통합 검색");
  let defaultsort = "desc";
  const a = await elasticsearch.search({
    index: "practice_ngram_nori",
    body: {
      size: 10,
      from: 0,
      query: {
        multi_match: {
          query: q,
          fields: ["content", "title", "reporter^3"],
        },
      },
      highlight: {
        fields: [{ "*": {} }],
        post_tags: ["</em></strong>"],
        pre_tags: ["<em><strong style='color:red;'>"],
      },
      sort: [{ _score: defaultsort }, "_score"],
      _source: ["reporter", "content", "title", "start_dttm"],
    },
  });
  console.log(a);
  console.log(a.hits.hits);
  let pageInfo = 1;
  let startdate = "";
  let findate = "";
  res.render("result", {
    pageInfo: pageInfo,
    data: a.hits.hits,
    q: q,
    totaldata: a,
    sort_data: defaultsort,
    startdate: startdate,
    findate: findate,
  });
});

router.get("/search", async (req, res) => {
  let paramdata = req.query;
  // console.log(paramdata.startdate);
  // console.log(paramdata.findate);
  let defaultsort = "";
  console.log(defaultsort.sort_data);
  if (paramdata.sort_data == null) {
    defaultsort = "desc";
  } else {
    defaultsort = paramdata.sort_data;
  }
  if ((paramdata.startdate = "" || paramdata.findate == "")) {
    const a = await elasticsearch.search({
      index: "practice_ngram_nori",
      body: {
        from: (paramdata.pageInfo - 1) * 10,
        size: 10,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: paramdata.q,
                  fields: ["reporter", "title", "content"],
                },
              },
            ],
          },
        },
        highlight: {
          fields: [{ "*": {} }],
          post_tags: ["</em>"],
          pre_tags: ["<em>"],
        },
        sort: [{ start_dttm: defaultsort }, "_score"],
        _source: ["reporter", "start_dttm", "title", "content"],
      },
    });
    res.render("result", {
      pageInfo: paramdata.pageInfo,
      data: a.hits.hits,
      totaldata: a,
      q: paramdata.q,
      sort_data: defaultsort,
      startdate: paramdata.startdate,
      findate: paramdata.findate,
    });
  } else {
    const a = await elasticsearch.search({
      index: "practice_ngram_nori",
      body: {
        from: (paramdata.pageInfo - 1) * 10,
        size: 10,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: paramdata.q,
                  fields: ["reporter", "title", "content"],
                },
              },
              {
                range: {
                  start_dttm: {
                    gte: paramdata.startdate,
                    lte: paramdata.findate,
                  },
                },
              },
            ],
          },
        },
        highlight: {
          fields: [{ "*": {} }],
          post_tags: ["</em>"],
          pre_tags: ["<em>"],
        },
        sort: [{ start_dttm: defaultsort }, "_score"],
        _source: ["reporter", "start_dttm", "title", "content"],
      },
    });
    res.render("result", {
      pageInfo: paramdata.pageInfo,
      data: a.hits.hits,
      totaldata: a,
      q: paramdata.q,
      sort_data: defaultsort,
      startdate: paramdata.startdate,
      findate: paramdata.findate,
    });
  }

  // let paramdata = req.query;
  // console.log(paramdata.startdate);
  // console.log(paramdata.findate);
  // let defaultsort = "";
  // console.log(defaultsort.sort_data);
  // if (paramdata.sort_data == null) {
  //   defaultsort = "desc";
  // } else {
  //   defaultsort = paramdata.sort_data;
  // }
  // const a = await elasticsearch.search({
  //   index: "practice_ngram_nori",
  //   body: {
  //     from: (paramdata.pageInfo - 1) * 10,
  //     size: 10,
  //     query: {
  //       bool: {
  //         must: [
  //           {
  //             multi_match: {
  //               query: paramdata.q,
  //               fields: [
  //                 "reporter.ngram",
  //                 "title.nori",
  //                 "content.nori",
  //                 "content.ngram",
  //                 "title.ngram",
  //               ],
  //             },
  //           },
  //           {
  //             range: {
  //               start_dttm: {
  //                 gte: paramdata.startdate,
  //                 lte: paramdata.findate,
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     sort: [{ start_dttm: defaultsort }, "_score"],
  //     _source: ["reporter", "start_dttm", "title", "content"],
  //   },
  // });
  // res.render("result", {
  //   pageInfo: paramdata.pageInfo,
  //   data: a.hits.hits,
  //   totaldata: a,
  //   q: paramdata.q,
  //   sort_data: defaultsort,
  //   startdate: paramdata.startdate,
  //   findate: paramdata.findate,
  // });
});

module.exports = router;
