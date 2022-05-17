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
  //솔트 초기값
  let defaultsort = "desc";
  const a = await elasticsearch.search({
    index: "sedaily__",
    body: {
      size: 10,
      from: 0,
      query: {
        multi_match: {
          query: q,
          fields: ["content", "title", "reporter^4"],
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
  console.log(paramdata.startdate);
  console.log(paramdata.findate);
  defaultsort = paramdata.sort_data;
  console.log(paramdata.sort_data);

  if (
    (paramdata.startdate == "" || paramdata.findate == "") &&
    paramdata.sort_data == "score"
  ) {
    const a = await elasticsearch.search({
      index: "sedaily__",
      body: {
        from: (paramdata.pageInfo - 1) * 10,
        size: 10,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: paramdata.q,
                  fields: ["reproter^4", "title", "title"],
                },
              },
            ],
          },
        },
        highlight: {
          fields: [{ "*": {} }],
          post_tags: ["</em></strong>"],
          pre_tags: ["<em><strong style='color:red;'>"],
        },
        sort: ["_score"],
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
  } else if (
    (paramdata.startdate == "" || paramdata.findate == "") &&
    paramdata.sort_data !== "score"
  ) {
    const a = await elasticsearch.search({
      index: "sedaily__",
      body: {
        from: (paramdata.pageInfo - 1) * 10,
        size: 10,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: paramdata.q,
                  fields: ["reporter^4", "title", "title"],
                },
              },
            ],
          },
        },
        highlight: {
          fields: [{ "*": {} }],
          post_tags: ["</em></strong>"],
          pre_tags: ["<em><strong style='color:red;'>"],
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
  } else if (paramdata.sort_data == "score") {
    console.log("test");
    const a = await elasticsearch.search({
      index: "sedaily__",
      body: {
        from: (paramdata.pageInfo - 1) * 10,
        size: 10,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: paramdata.q,
                  fields: ["reporter^3", "title", "title"],
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
          post_tags: ["</em></strong>"],
          pre_tags: ["<em><strong style='color:red;'>"],
        },
        sort: ["_score"],
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
  } else if (paramdata.sort_data !== "score") {
    console.log("test");
    const a = await elasticsearch.search({
      index: "sedaily__",
      body: {
        from: (paramdata.pageInfo - 1) * 10,
        size: 10,
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: paramdata.q,
                  fields: ["reproter^4", "title", "title"],
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
          post_tags: ["</em></strong>"],
          pre_tags: ["<em><strong style='color:red;'>"],
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
});

module.exports = router;
