const express = require("express");
const req = require("express/lib/request");
const res = require("express/lib/response");
var router = express.Router();
var router = express.Router();
const elasticsearch = require("../util/elasticClient");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/search_text_repoter", async (req, res) => {
  console.log(req.body.keyword);
  console.log(req.body.keyword2);
  const a = await elasticsearch.search({
    index: "practice",
    body: {
      query: {
        bool: {
          must: [
            {
              match_phrase_prefix: {
                reporter: req.body.keyword,
              },
            },
            {
              match: {
                update_dttm: req.body.keyword2,
              },
            },
          ],
        },
      },
    },
  });
  res.send(a);
});

router.post("/search_text_date", async (req, res) => {
  console.log(req.body.text);
  console.log(req.body.startdate);
  console.log(req.body.findate);
  const aa = await elasticsearch.search({
    index: "practice",
    body: {
      query: {
        bool: {
          must: [
            {
              match_phrase_prefix: {
                category: req.body.category,
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
    },
  });
  res.send(aa);
});

router.post("/search_text", async (req, res) => {
  const q = req.body.word;
  const aaa = await elasticsearch.search({
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
  res.send(aaa);
});

module.exports = router;
