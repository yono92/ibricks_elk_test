const express = require("express");
const elasticsearch = require("../util/elasticClient");

const router = express.Router();

// 1. 날짜 필터 조건 검색
router.post("/dateSearch", async (req, res) => {
  console.log(
    "#21# /dateSearch 특정 날짜 이후의 글 검색 > " + req.body.update_dttm
  );

  let a;
  try {
    a = await elasticsearch.search({
      index: "practice",
      body: {
        query: {
          range: {
            update_dttm: {
              gt: req.body.update_dttm,
            },
          },
        },
      },
    });
  } catch (e) {
    console.log("#21# /dateSearch Error 발생 > " + e);
  }

  res.send(a);
});

// 2. 리포터 이름 검색
router.post("/reporterSearch", async (req, res) => {
  console.log("#21# /reporterSearch 리포트 이름 검색 > " + req.body.reporter);

  let a;
  try {
    a = await elasticsearch.search({
      index: "practice",
      body: {
        query: {
          match_phrase_prefix: {
            reporter: req.body.reporter,
          },
        },
      },
    });
  } catch (e) {
    console.log("#21# /reporterSearch Error 발생 > " + e);
  }

  res.send(a);
});

// 3. content(내용) 검색
router.post("/contentSearch", async (req, res) => {
  console.log("#21# /contentSearch content(내용) 검색 > " + req.body.content);

  let a;
  try {
    a = await elasticsearch.search({
      index: "practice",
      body: {
        query: {
          match_phrase_prefix: {
            content: req.body.content,
          },
        },
      },
    });
  } catch (e) {
    console.log("#21# /contentSearch Error 발생 > " + e);
  }

  res.send(a);
});

// 4. title(제목) 검색
router.post("/titleSearch", async (req, res) => {
  console.log("#21# /titleSearch title(제목) 검색 > " + req.body.title);

  let a;
  try {
    a = await elasticsearch.search({
      index: "practice",
      body: {
        query: {
          match_phrase_prefix: {
            title: req.body.title,
          },
        },
      },
    });
  } catch (e) {
    console.log("#21# /titleSearch Error 발생 > " + e);
  }

  res.send(a);
});

// 5. and 조건 검색 (날짜, 기자, content, title)
router.post("/andSearch", async (req, res) => {
  console.log("#21# /andSearch and 조건 _모든 조건에 true 인 글 검색 > ");
  console.log("1) 날짜 > " + req.body.update_dttm);
  console.log("2) 기자 > " + req.body.reporter);
  console.log("3) content > " + req.body.content);
  console.log("4) title > " + req.body.title);

  let a;
  try {
    a = await elasticsearch.search({
      index: "practice",
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  title: req.body.title,
                },
              },
              {
                match: {
                  content: req.body.content,
                },
              },
              {
                match: {
                  reporter: req.body.reporter,
                },
              },
              {
                range: {
                  update_dttm: {
                    gt: req.body.update_dttm,
                  },
                },
              },
            ],
          },
        },
      },
    });
  } catch (e) {
    console.log("#21# /andSearch Error 발생 > " + e);
  }

  res.send(a);
});

// 6. 위의 5개의 검색조건 병합
router.post("/totalSearch", async (req, res) => {
  console.log("#21# /totalSearch 검색조건을 선택하여 검색");
  // 검색조건: date = 날짜 검색, reporter = 기자 검색, content = 내용 검색, title = 제목 검색, all = and 검색
  console.log(">> 선택한 검색 조건: " + req.body.choice);
  console.log("1) 날짜 > " + req.body.update_dttm);
  console.log("2) 기자 > " + req.body.reporter);
  console.log("3) content > " + req.body.content);
  console.log("4) title > " + req.body.title);

  let a;
  try {
    // 1. 날짜 검색
    if (req.body.choice == "date") {
      a = await elasticsearch.search({
        index: "practice",
        body: {
          query: {
            range: {
              update_dttm: {
                gt: req.body.update_dttm,
              },
            },
          },
        },
      });
      // 2. 기자 이름 검색
    } else if (req.body.choice == "reporter") {
      a = await elasticsearch.search({
        index: "practice",
        body: {
          query: {
            match_phrase_prefix: {
              reporter: req.body.reporter,
            },
          },
        },
      });
      // 3. content(내용) 검색
    } else if (req.body.choice == "content") {
      a = await elasticsearch.search({
        index: "practice",
        body: {
          query: {
            match_phrase_prefix: {
              content: req.body.content,
            },
          },
        },
      });
      // 4. title(제목) 검색
    } else if (req.body.choice == "title") {
      a = await elasticsearch.search({
        index: "practice",
        body: {
          query: {
            match_phrase_prefix: {
              title: req.body.title,
            },
          },
        },
      });
      // 5. and 검색
    } else if (req.body.choice == "all") {
      a = await elasticsearch.search({
        index: "practice",
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    title: req.body.title,
                  },
                },
                {
                  match: {
                    content: req.body.content,
                  },
                },
                {
                  match: {
                    reporter: req.body.reporter,
                  },
                },
                {
                  range: {
                    update_dttm: {
                      gt: req.body.update_dttm,
                    },
                  },
                },
              ],
            },
          },
        },
      });
    } else {
      console.log(
        "#21# /totalSearch 검색조건에 해당되지 않는 값 입니다. > " +
          req.body.choice
      );
      res.send("![Error] 검색조건에 해당되지 않는 값 입니다.");
    }
  } catch (e) {
    console.log("#21# /totalSearch Error 발생 > " + e);
  }

  // response 값으로 "날짜, 기자, content"만 출력
  // res.send(a);
  const result = a.hits.hits;
  let resultList = new Array();

  result.forEach(function (item, index, resultArray) {
    const tempObject = new Object();

    tempObject.index = index;
    tempObject.reporter = item._source.reporter;
    // HTML 태그 제거
    tempObject.content = item._source.content;
    //tempObject.content = htmlRemove(item._source.content)
    //console.log("#21# content 내 HTML 태그 제거 확인 > " + tempObject.content);

    tempObject.update_dttm = item._source.update_dttm;

    resultList.push(tempObject);
  });

  res.send(resultList);
});

// function htmlRemove(contentText) {
//     console.log("#21# 받아온 content값 (HTML 태그 지우기 전) > " + JSON.stringify(contentText));
//
//     router.post('/totalSearch', async (req, res) => {
//             console.log("#21# /totalSearch content(내용) 내 HTML 태그 제거");
//
//             let a;
//             try {
//                 a =  await elasticsearch.analyze({
//                     index: "practice",
//                     tokenizer: "keyword",
//                     charFilter: "html_strip",
//                     text: contentText
//                 })
//
//                 console.log("#21# HTML 태그 제거 확인 > " + a)
//             } catch (e) {
//                 console.log("#21# /totalSearch content(내용) 내 HTML 태그 제거 Error 발생 > " + e);
//             }
//
//             //res.send(a);
//             return res._source.content(a);
//         })
//     }
// }

module.exports = router;
