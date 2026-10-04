// src/data/seed.ts
var SEED_ROWS = {
  "flight": [
    // 计划到达围绕同一天（2026-10-04）编排，故意埋入机位撞车与班组撞车，供存量回填校验演示。
    // 回填让位次序：计划到达早者先保位 → 同时到达按保障等级（要客>一级>二级>三级）→ 再按任务 id。
    // 撞车点：id4 撞 id1（机位101+甲班，两条证据同时成立、机位先算）；id8 撞 id7（机位103，纯机位）；
    // id10 撞 id6（乙班同时段，纯班组）。占用窗口为计划到达前30分钟至后90分钟。
    {
      "id": 1,
      "status": "\u4FDD\u969C\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0001",
      "\u822A\u73ED\u53F7": "CA1201",
      "\u673A\u578B": "A320",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 09:00",
      "\u673A\u4F4D\u53F7": "101",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E00\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u7532\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u4FDD\u969C\u4E2D"
    },
    {
      "id": 2,
      "status": "\u4FDD\u969C\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0002",
      "\u822A\u73ED\u53F7": "MU5302",
      "\u673A\u578B": "B738",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 09:30",
      "\u673A\u4F4D\u53F7": "102",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E8C\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u4E59\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u4FDD\u969C\u4E2D"
    },
    {
      "id": 3,
      "status": "\u4FDD\u969C\u5B8C\u6210",
      "pending": false,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0003",
      "\u822A\u73ED\u53F7": "CZ3108",
      "\u673A\u578B": "A321",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 08:15",
      "\u673A\u4F4D\u53F7": "201",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E09\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u4E19\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u4FDD\u969C\u5B8C\u6210"
    },
    {
      "id": 4,
      "status": "\u5F85\u63A5\u6536",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0004",
      "\u822A\u73ED\u53F7": "HU7801",
      "\u673A\u578B": "B789",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 09:40",
      "\u673A\u4F4D\u53F7": "101",
      "\u4FDD\u969C\u7B49\u7EA7": "\u8981\u5BA2",
      "\u4FDD\u969C\u73ED\u7EC4": "\u7532\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u5F85\u63A5\u6536"
    },
    {
      "id": 5,
      "status": "\u5F85\u63A5\u6536",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0005",
      "\u822A\u73ED\u53F7": "CA1202",
      "\u673A\u578B": "A320",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 07:00",
      "\u673A\u4F4D\u53F7": "202",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E09\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u4E59\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u5F85\u63A5\u6536"
    },
    {
      "id": 6,
      "status": "\u4FDD\u969C\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0006",
      "\u822A\u73ED\u53F7": "MU5309",
      "\u673A\u578B": "A330",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 12:00",
      "\u673A\u4F4D\u53F7": "104",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E00\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u4E59\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u4FDD\u969C\u4E2D"
    },
    {
      "id": 7,
      "status": "\u4FDD\u969C\u5B8C\u6210",
      "pending": false,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0007",
      "\u822A\u73ED\u53F7": "CZ3110",
      "\u673A\u578B": "B738",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 12:30",
      "\u673A\u4F4D\u53F7": "103",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E8C\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u7532\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u4FDD\u969C\u5B8C\u6210"
    },
    {
      "id": 8,
      "status": "\u5F85\u63A5\u6536",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0008",
      "\u822A\u73ED\u53F7": "HU7805",
      "\u673A\u578B": "A320",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 12:40",
      "\u673A\u4F4D\u53F7": "103",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E09\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u4E19\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u5F85\u63A5\u6536"
    },
    {
      "id": 9,
      "status": "\u5F85\u63A5\u6536",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0009",
      "\u822A\u73ED\u53F7": "CA9999",
      "\u673A\u578B": "A320",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-05 09:20",
      "\u673A\u4F4D\u53F7": "101",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E09\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u7532\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u5F85\u63A5\u6536"
    },
    {
      "id": 10,
      "status": "\u5F85\u63A5\u6536",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "FLIG-0010",
      "\u822A\u73ED\u53F7": "3U8888",
      "\u673A\u578B": "A320",
      "\u8BA1\u5212\u5230\u8FBE": "2026-10-04 12:10",
      "\u673A\u4F4D\u53F7": "203",
      "\u4FDD\u969C\u7B49\u7EA7": "\u4E8C\u7EA7",
      "\u4FDD\u969C\u73ED\u7EC4": "\u4E59\u73ED",
      "\u4FDD\u969C\u72B6\u6001": "\u5F85\u63A5\u6536"
    }
  ],
  "stand": [
    {
      "id": 1,
      "status": "\u5360\u7528\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u673A\u4F4D\u7F16\u53F7": "101",
      "\u673A\u4F4D\u7C7B\u578B": "\u5ECA\u6865\u673A\u4F4D",
      "\u9002\u7528\u673A\u578B": "A320/B738/B789",
      "\u5ECA\u6865\u914D\u7F6E": "\u6709",
      "\u8FD1\u8FDC\u673A\u4F4D": "\u8FD1\u673A\u4F4D",
      "\u5360\u7528\u65F6\u6BB5": "",
      "\u5F53\u524D\u822A\u73ED": "",
      "\u5360\u7528\u5F85\u529E": "",
      "\u673A\u4F4D\u72B6\u6001": ""
    },
    {
      "id": 2,
      "status": "\u5360\u7528\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u673A\u4F4D\u7F16\u53F7": "102",
      "\u673A\u4F4D\u7C7B\u578B": "\u5ECA\u6865\u673A\u4F4D",
      "\u9002\u7528\u673A\u578B": "A320/B738",
      "\u5ECA\u6865\u914D\u7F6E": "\u6709",
      "\u8FD1\u8FDC\u673A\u4F4D": "\u8FD1\u673A\u4F4D",
      "\u5360\u7528\u65F6\u6BB5": "",
      "\u5F53\u524D\u822A\u73ED": "",
      "\u5360\u7528\u5F85\u529E": "",
      "\u673A\u4F4D\u72B6\u6001": ""
    },
    {
      "id": 3,
      "status": "\u5360\u7528\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u673A\u4F4D\u7F16\u53F7": "103",
      "\u673A\u4F4D\u7C7B\u578B": "\u5ECA\u6865\u673A\u4F4D",
      "\u9002\u7528\u673A\u578B": "A330/A320/B738",
      "\u5ECA\u6865\u914D\u7F6E": "\u6709",
      "\u8FD1\u8FDC\u673A\u4F4D": "\u8FD1\u673A\u4F4D",
      "\u5360\u7528\u65F6\u6BB5": "",
      "\u5F53\u524D\u822A\u73ED": "",
      "\u5360\u7528\u5F85\u529E": "",
      "\u673A\u4F4D\u72B6\u6001": ""
    },
    {
      "id": 4,
      "status": "\u5360\u7528\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u673A\u4F4D\u7F16\u53F7": "104",
      "\u673A\u4F4D\u7C7B\u578B": "\u5ECA\u6865\u673A\u4F4D",
      "\u9002\u7528\u673A\u578B": "A330/A320/B738",
      "\u5ECA\u6865\u914D\u7F6E": "\u6709",
      "\u8FD1\u8FDC\u673A\u4F4D": "\u8FD1\u673A\u4F4D",
      "\u5360\u7528\u65F6\u6BB5": "",
      "\u5F53\u524D\u822A\u73ED": "",
      "\u5360\u7528\u5F85\u529E": "",
      "\u673A\u4F4D\u72B6\u6001": ""
    },
    {
      "id": 5,
      "status": "\u7EF4\u62A4\u4E2D",
      "pending": true,
      "abnormal": false,
      "\u673A\u4F4D\u7F16\u53F7": "201",
      "\u673A\u4F4D\u7C7B\u578B": "\u8FDC\u673A\u4F4D",
      "\u9002\u7528\u673A\u578B": "A321/A320",
      "\u5ECA\u6865\u914D\u7F6E": "\u65E0",
      "\u8FD1\u8FDC\u673A\u4F4D": "\u8FDC\u673A\u4F4D",
      "\u5360\u7528\u65F6\u6BB5": "",
      "\u5F53\u524D\u822A\u73ED": "",
      "\u5360\u7528\u5F85\u529E": "",
      "\u673A\u4F4D\u72B6\u6001": ""
    },
    {
      "id": 6,
      "status": "\u7A7A\u95F2",
      "pending": false,
      "abnormal": false,
      "\u673A\u4F4D\u7F16\u53F7": "202",
      "\u673A\u4F4D\u7C7B\u578B": "\u8FDC\u673A\u4F4D",
      "\u9002\u7528\u673A\u578B": "A320/B738",
      "\u5ECA\u6865\u914D\u7F6E": "\u65E0",
      "\u8FD1\u8FDC\u673A\u4F4D": "\u8FDC\u673A\u4F4D",
      "\u5360\u7528\u65F6\u6BB5": "",
      "\u5F53\u524D\u822A\u73ED": "",
      "\u5360\u7528\u5F85\u529E": "",
      "\u673A\u4F4D\u72B6\u6001": ""
    },
    {
      "id": 7,
      "status": "\u7A7A\u95F2",
      "pending": false,
      "abnormal": false,
      "\u673A\u4F4D\u7F16\u53F7": "203",
      "\u673A\u4F4D\u7C7B\u578B": "\u8FDC\u673A\u4F4D",
      "\u9002\u7528\u673A\u578B": "A320/B738",
      "\u5ECA\u6865\u914D\u7F6E": "\u65E0",
      "\u8FD1\u8FDC\u673A\u4F4D": "\u8FDC\u673A\u4F4D",
      "\u5360\u7528\u65F6\u6BB5": "",
      "\u5F53\u524D\u822A\u73ED": "",
      "\u5360\u7528\u5F85\u529E": "",
      "\u673A\u4F4D\u72B6\u6001": ""
    }
  ],
  "bridge": [
    {
      "id": 1,
      "status": "\u5F85\u9760\u63A5",
      "pending": true,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "BRID-0001",
      "\u5ECA\u6865\u7F16\u53F7": "BRID-0001",
      "\u5BF9\u5E94\u673A\u4F4D": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B1",
      "\u9760\u6865\u65F6\u95F4": "2026-09-01",
      "\u64A4\u6865\u65F6\u95F4": "2026-09-01",
      "\u64CD\u4F5C\u4EBA\u5458": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B1",
      "\u5BF9\u63A5\u68C0\u67E5\u9879": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B1",
      "\u4F5C\u4E1A\u72B6\u6001": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u5DF2\u9760\u6865",
      "pending": true,
      "abnormal": true,
      "\u4F5C\u4E1A\u7F16\u53F7": "BRID-0002",
      "\u5ECA\u6865\u7F16\u53F7": "BRID-0002",
      "\u5BF9\u5E94\u673A\u4F4D": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B2",
      "\u9760\u6865\u65F6\u95F4": "2026-09-02",
      "\u64A4\u6865\u65F6\u95F4": "2026-09-02",
      "\u64CD\u4F5C\u4EBA\u5458": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B2",
      "\u5BF9\u63A5\u68C0\u67E5\u9879": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B2",
      "\u4F5C\u4E1A\u72B6\u6001": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5DF2\u64A4\u79BB",
      "pending": false,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "BRID-0003",
      "\u5ECA\u6865\u7F16\u53F7": "BRID-0003",
      "\u5BF9\u5E94\u673A\u4F4D": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B3",
      "\u9760\u6865\u65F6\u95F4": "2026-09-03",
      "\u64A4\u6865\u65F6\u95F4": "2026-09-03",
      "\u64CD\u4F5C\u4EBA\u5458": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B3",
      "\u5BF9\u63A5\u68C0\u67E5\u9879": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B3",
      "\u4F5C\u4E1A\u72B6\u6001": "\u5ECA\u6865\u9760\u63A5\u6837\u4F8B3"
    }
  ],
  "shuttle": [
    {
      "id": 1,
      "status": "\u5F85\u547D",
      "pending": true,
      "abnormal": false,
      "\u8F66\u8F86\u7F16\u53F7": "SHUT-0001",
      "\u6838\u8F7D\u4EBA\u6570": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B1",
      "\u9A7E\u9A76\u5458": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B1",
      "\u5F53\u524D\u4EFB\u52A1": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B1",
      "\u53D1\u8F66\u65F6\u95F4": "2026-09-01",
      "\u884C\u9A76\u8DEF\u7EBF": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B1",
      "\u91CC\u7A0B\u8BFB\u6570": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B1",
      "\u8F66\u8F86\u72B6\u6001": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u6267\u884C\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u8F66\u8F86\u7F16\u53F7": "SHUT-0002",
      "\u6838\u8F7D\u4EBA\u6570": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B2",
      "\u9A7E\u9A76\u5458": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B2",
      "\u5F53\u524D\u4EFB\u52A1": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B2",
      "\u53D1\u8F66\u65F6\u95F4": "2026-09-02",
      "\u884C\u9A76\u8DEF\u7EBF": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B2",
      "\u91CC\u7A0B\u8BFB\u6570": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B2",
      "\u8F66\u8F86\u72B6\u6001": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5145\u7535\u4E2D",
      "pending": false,
      "abnormal": false,
      "\u8F66\u8F86\u7F16\u53F7": "SHUT-0003",
      "\u6838\u8F7D\u4EBA\u6570": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B3",
      "\u9A7E\u9A76\u5458": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B3",
      "\u5F53\u524D\u4EFB\u52A1": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B3",
      "\u53D1\u8F66\u65F6\u95F4": "2026-09-03",
      "\u884C\u9A76\u8DEF\u7EBF": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B3",
      "\u91CC\u7A0B\u8BFB\u6570": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B3",
      "\u8F66\u8F86\u72B6\u6001": "\u6446\u6E21\u8F66\u8C03\u5EA6\u6837\u4F8B3"
    }
  ],
  "baggage": [
    {
      "id": 1,
      "status": "\u5F85\u88C5\u8F7D",
      "pending": true,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "BAGG-0001",
      "\u822A\u73ED\u53F7": "\u884C\u674E\u88C5\u5378\u6837\u4F8B1",
      "\u884C\u674E\u4EF6\u6570": "\u884C\u674E\u88C5\u5378\u6837\u4F8B1",
      "\u88C5\u5378\u73ED\u7EC4": "\u884C\u674E\u88C5\u5378\u6837\u4F8B1",
      "\u4F20\u9001\u5E26\u7F16\u53F7": "BAGG-0001",
      "\u88C5\u8F7D\u8231\u4F4D": "\u884C\u674E\u88C5\u5378\u6837\u4F8B1",
      "\u590D\u6838\u4EBA\u5458": "\u884C\u674E\u88C5\u5378\u6837\u4F8B1",
      "\u4F5C\u4E1A\u72B6\u6001": "\u884C\u674E\u88C5\u5378\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u88C5\u8F7D\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4F5C\u4E1A\u7F16\u53F7": "BAGG-0002",
      "\u822A\u73ED\u53F7": "\u884C\u674E\u88C5\u5378\u6837\u4F8B2",
      "\u884C\u674E\u4EF6\u6570": "\u884C\u674E\u88C5\u5378\u6837\u4F8B2",
      "\u88C5\u5378\u73ED\u7EC4": "\u884C\u674E\u88C5\u5378\u6837\u4F8B2",
      "\u4F20\u9001\u5E26\u7F16\u53F7": "BAGG-0002",
      "\u88C5\u8F7D\u8231\u4F4D": "\u884C\u674E\u88C5\u5378\u6837\u4F8B2",
      "\u590D\u6838\u4EBA\u5458": "\u884C\u674E\u88C5\u5378\u6837\u4F8B2",
      "\u4F5C\u4E1A\u72B6\u6001": "\u884C\u674E\u88C5\u5378\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u590D\u6838",
      "pending": false,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "BAGG-0003",
      "\u822A\u73ED\u53F7": "\u884C\u674E\u88C5\u5378\u6837\u4F8B3",
      "\u884C\u674E\u4EF6\u6570": "\u884C\u674E\u88C5\u5378\u6837\u4F8B3",
      "\u88C5\u5378\u73ED\u7EC4": "\u884C\u674E\u88C5\u5378\u6837\u4F8B3",
      "\u4F20\u9001\u5E26\u7F16\u53F7": "BAGG-0003",
      "\u88C5\u8F7D\u8231\u4F4D": "\u884C\u674E\u88C5\u5378\u6837\u4F8B3",
      "\u590D\u6838\u4EBA\u5458": "\u884C\u674E\u88C5\u5378\u6837\u4F8B3",
      "\u4F5C\u4E1A\u72B6\u6001": "\u884C\u674E\u88C5\u5378\u6837\u4F8B3"
    }
  ],
  "line": [
    {
      "id": 1,
      "status": "\u5F85\u6267\u884C",
      "pending": true,
      "abnormal": false,
      "\u4EFB\u52A1\u7F16\u53F7": "LINE-0001",
      "\u822A\u73ED\u53F7": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B1",
      "\u52E4\u52A1\u9879\u76EE": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B1",
      "\u653E\u884C\u4EBA\u5458": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B1",
      "\u5F00\u59CB\u65F6\u95F4": "2026-09-01",
      "\u7ED3\u675F\u65F6\u95F4": "2026-09-01",
      "\u68C0\u67E5\u5355\u53F7": "LINE-0001",
      "\u4EFB\u52A1\u72B6\u6001": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u6267\u884C\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4EFB\u52A1\u7F16\u53F7": "LINE-0002",
      "\u822A\u73ED\u53F7": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B2",
      "\u52E4\u52A1\u9879\u76EE": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B2",
      "\u653E\u884C\u4EBA\u5458": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B2",
      "\u5F00\u59CB\u65F6\u95F4": "2026-09-02",
      "\u7ED3\u675F\u65F6\u95F4": "2026-09-02",
      "\u68C0\u67E5\u5355\u53F7": "LINE-0002",
      "\u4EFB\u52A1\u72B6\u6001": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u653E\u884C",
      "pending": false,
      "abnormal": false,
      "\u4EFB\u52A1\u7F16\u53F7": "LINE-0003",
      "\u822A\u73ED\u53F7": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B3",
      "\u52E4\u52A1\u9879\u76EE": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B3",
      "\u653E\u884C\u4EBA\u5458": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B3",
      "\u5F00\u59CB\u65F6\u95F4": "2026-09-03",
      "\u7ED3\u675F\u65F6\u95F4": "2026-09-03",
      "\u68C0\u67E5\u5355\u53F7": "LINE-0003",
      "\u4EFB\u52A1\u72B6\u6001": "\u673A\u52A1\u52E4\u52A1\u6837\u4F8B3"
    }
  ],
  "fueling": [
    {
      "id": 1,
      "status": "\u5F85\u52A0\u6CE8",
      "pending": true,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "FUEL-0001",
      "\u822A\u73ED\u53F7": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B1",
      "\u6CB9\u54C1\u89C4\u683C": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B1",
      "\u52A0\u6CE8\u91CF": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B1",
      "\u52A0\u6CB9\u8F66\u53F7": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B1",
      "\u4F5C\u4E1A\u4EBA\u5458": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B1",
      "\u9759\u7535\u63A5\u5730\u68C0\u67E5": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B1",
      "\u4F5C\u4E1A\u72B6\u6001": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u52A0\u6CE8\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4F5C\u4E1A\u7F16\u53F7": "FUEL-0002",
      "\u822A\u73ED\u53F7": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B2",
      "\u6CB9\u54C1\u89C4\u683C": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B2",
      "\u52A0\u6CE8\u91CF": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B2",
      "\u52A0\u6CB9\u8F66\u53F7": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B2",
      "\u4F5C\u4E1A\u4EBA\u5458": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B2",
      "\u9759\u7535\u63A5\u5730\u68C0\u67E5": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B2",
      "\u4F5C\u4E1A\u72B6\u6001": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u786E\u8BA4",
      "pending": false,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "FUEL-0003",
      "\u822A\u73ED\u53F7": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B3",
      "\u6CB9\u54C1\u89C4\u683C": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B3",
      "\u52A0\u6CE8\u91CF": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B3",
      "\u52A0\u6CB9\u8F66\u53F7": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B3",
      "\u4F5C\u4E1A\u4EBA\u5458": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B3",
      "\u9759\u7535\u63A5\u5730\u68C0\u67E5": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B3",
      "\u4F5C\u4E1A\u72B6\u6001": "\u822A\u6CB9\u52A0\u6CE8\u6837\u4F8B3"
    }
  ],
  "deice": [
    {
      "id": 1,
      "status": "\u5F85\u9664\u51B0",
      "pending": true,
      "abnormal": false,
      "\u4EFB\u52A1\u7F16\u53F7": "DEIC-0001",
      "\u822A\u73ED\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B1",
      "\u9664\u51B0\u6DB2\u578B\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B1",
      "\u55B7\u6D12\u91CF": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B1",
      "\u9664\u51B0\u8F66\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B1",
      "\u4F5C\u4E1A\u65F6\u957F": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B1",
      "\u64CD\u4F5C\u4EBA\u5458": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B1",
      "\u4EFB\u52A1\u72B6\u6001": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u9664\u51B0\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4EFB\u52A1\u7F16\u53F7": "DEIC-0002",
      "\u822A\u73ED\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B2",
      "\u9664\u51B0\u6DB2\u578B\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B2",
      "\u55B7\u6D12\u91CF": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B2",
      "\u9664\u51B0\u8F66\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B2",
      "\u4F5C\u4E1A\u65F6\u957F": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B2",
      "\u64CD\u4F5C\u4EBA\u5458": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B2",
      "\u4EFB\u52A1\u72B6\u6001": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u786E\u8BA4",
      "pending": false,
      "abnormal": false,
      "\u4EFB\u52A1\u7F16\u53F7": "DEIC-0003",
      "\u822A\u73ED\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B3",
      "\u9664\u51B0\u6DB2\u578B\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B3",
      "\u55B7\u6D12\u91CF": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B3",
      "\u9664\u51B0\u8F66\u53F7": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B3",
      "\u4F5C\u4E1A\u65F6\u957F": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B3",
      "\u64CD\u4F5C\u4EBA\u5458": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B3",
      "\u4EFB\u52A1\u72B6\u6001": "\u9664\u51B0\u4F5C\u4E1A\u6837\u4F8B3"
    }
  ],
  "gpu": [
    {
      "id": 1,
      "status": "\u5F85\u547D",
      "pending": true,
      "abnormal": false,
      "\u8BBE\u5907\u7F16\u53F7": "GPU-0001",
      "\u8BBE\u5907\u7C7B\u578B": "\u5730\u9762\u7535\u6E90\u6837\u4F8B1",
      "\u529F\u7387\u7B49\u7EA7": "\u5730\u9762\u7535\u6E90\u6837\u4F8B1",
      "\u63A5\u673A\u822A\u73ED": "\u5730\u9762\u7535\u6E90\u6837\u4F8B1",
      "\u4F9B\u7535\u65F6\u957F": "\u5730\u9762\u7535\u6E90\u6837\u4F8B1",
      "\u64CD\u4F5C\u4EBA\u5458": "\u5730\u9762\u7535\u6E90\u6837\u4F8B1",
      "\u7535\u7F06\u68C0\u67E5": "\u5730\u9762\u7535\u6E90\u6837\u4F8B1",
      "\u8BBE\u5907\u72B6\u6001": "\u5730\u9762\u7535\u6E90\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u4F9B\u7535\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u8BBE\u5907\u7F16\u53F7": "GPU-0002",
      "\u8BBE\u5907\u7C7B\u578B": "\u5730\u9762\u7535\u6E90\u6837\u4F8B2",
      "\u529F\u7387\u7B49\u7EA7": "\u5730\u9762\u7535\u6E90\u6837\u4F8B2",
      "\u63A5\u673A\u822A\u73ED": "\u5730\u9762\u7535\u6E90\u6837\u4F8B2",
      "\u4F9B\u7535\u65F6\u957F": "\u5730\u9762\u7535\u6E90\u6837\u4F8B2",
      "\u64CD\u4F5C\u4EBA\u5458": "\u5730\u9762\u7535\u6E90\u6837\u4F8B2",
      "\u7535\u7F06\u68C0\u67E5": "\u5730\u9762\u7535\u6E90\u6837\u4F8B2",
      "\u8BBE\u5907\u72B6\u6001": "\u5730\u9762\u7535\u6E90\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u68C0\u4FEE",
      "pending": false,
      "abnormal": false,
      "\u8BBE\u5907\u7F16\u53F7": "GPU-0003",
      "\u8BBE\u5907\u7C7B\u578B": "\u5730\u9762\u7535\u6E90\u6837\u4F8B3",
      "\u529F\u7387\u7B49\u7EA7": "\u5730\u9762\u7535\u6E90\u6837\u4F8B3",
      "\u63A5\u673A\u822A\u73ED": "\u5730\u9762\u7535\u6E90\u6837\u4F8B3",
      "\u4F9B\u7535\u65F6\u957F": "\u5730\u9762\u7535\u6E90\u6837\u4F8B3",
      "\u64CD\u4F5C\u4EBA\u5458": "\u5730\u9762\u7535\u6E90\u6837\u4F8B3",
      "\u7535\u7F06\u68C0\u67E5": "\u5730\u9762\u7535\u6E90\u6837\u4F8B3",
      "\u8BBE\u5907\u72B6\u6001": "\u5730\u9762\u7535\u6E90\u6837\u4F8B3"
    }
  ],
  "tow": [
    {
      "id": 1,
      "status": "\u5F85\u7275\u5F15",
      "pending": true,
      "abnormal": false,
      "\u4EFB\u52A1\u7F16\u53F7": "TOW-0001",
      "\u822A\u73ED\u53F7": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B1",
      "\u7275\u5F15\u8F66\u53F7": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B1",
      "\u8D77\u59CB\u673A\u4F4D": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B1",
      "\u76EE\u6807\u673A\u4F4D": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B1",
      "\u9A7E\u9A76\u5458": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B1",
      "\u62A4\u9001\u4EBA\u5458": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B1",
      "\u4EFB\u52A1\u72B6\u6001": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u7275\u5F15\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4EFB\u52A1\u7F16\u53F7": "TOW-0002",
      "\u822A\u73ED\u53F7": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B2",
      "\u7275\u5F15\u8F66\u53F7": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B2",
      "\u8D77\u59CB\u673A\u4F4D": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B2",
      "\u76EE\u6807\u673A\u4F4D": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B2",
      "\u9A7E\u9A76\u5458": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B2",
      "\u62A4\u9001\u4EBA\u5458": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B2",
      "\u4EFB\u52A1\u72B6\u6001": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u786E\u8BA4",
      "pending": false,
      "abnormal": false,
      "\u4EFB\u52A1\u7F16\u53F7": "TOW-0003",
      "\u822A\u73ED\u53F7": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B3",
      "\u7275\u5F15\u8F66\u53F7": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B3",
      "\u8D77\u59CB\u673A\u4F4D": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B3",
      "\u76EE\u6807\u673A\u4F4D": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B3",
      "\u9A7E\u9A76\u5458": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B3",
      "\u62A4\u9001\u4EBA\u5458": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B3",
      "\u4EFB\u52A1\u72B6\u6001": "\u822A\u7A7A\u5668\u7275\u5F15\u6837\u4F8B3"
    }
  ],
  "catering": [
    {
      "id": 1,
      "status": "\u5F85\u914D\u9910",
      "pending": true,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "CATE-0001",
      "\u822A\u73ED\u53F7": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B1",
      "\u9910\u98DF\u6570\u91CF": 10,
      "\u914D\u9910\u516C\u53F8": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B1",
      "\u9910\u8F66\u7F16\u53F7": "CATE-0001",
      "\u88C5\u8F7D\u8231\u95E8": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B1",
      "\u4EA4\u63A5\u4EBA\u5458": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B1",
      "\u4F5C\u4E1A\u72B6\u6001": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u914D\u9001\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4F5C\u4E1A\u7F16\u53F7": "CATE-0002",
      "\u822A\u73ED\u53F7": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B2",
      "\u9910\u98DF\u6570\u91CF": 20,
      "\u914D\u9910\u516C\u53F8": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B2",
      "\u9910\u8F66\u7F16\u53F7": "CATE-0002",
      "\u88C5\u8F7D\u8231\u95E8": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B2",
      "\u4EA4\u63A5\u4EBA\u5458": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B2",
      "\u4F5C\u4E1A\u72B6\u6001": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u4EA4\u63A5",
      "pending": false,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "CATE-0003",
      "\u822A\u73ED\u53F7": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B3",
      "\u9910\u98DF\u6570\u91CF": 30,
      "\u914D\u9910\u516C\u53F8": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B3",
      "\u9910\u8F66\u7F16\u53F7": "CATE-0003",
      "\u88C5\u8F7D\u8231\u95E8": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B3",
      "\u4EA4\u63A5\u4EBA\u5458": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B3",
      "\u4F5C\u4E1A\u72B6\u6001": "\u822A\u7A7A\u914D\u9910\u6837\u4F8B3"
    }
  ],
  "cabin": [
    {
      "id": 1,
      "status": "\u5F85\u6E05\u6D01",
      "pending": true,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "CABI-0001",
      "\u822A\u73ED\u53F7": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B1",
      "\u6E05\u6D01\u73ED\u7EC4": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B1",
      "\u4F5C\u4E1A\u9879\u6570": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B1",
      "\u7528\u6C34\u91CF": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B1",
      "\u8017\u6750\u9886\u7528": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B1",
      "\u8D28\u68C0\u4EBA\u5458": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B1",
      "\u4F5C\u4E1A\u72B6\u6001": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u6E05\u6D01\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4F5C\u4E1A\u7F16\u53F7": "CABI-0002",
      "\u822A\u73ED\u53F7": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B2",
      "\u6E05\u6D01\u73ED\u7EC4": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B2",
      "\u4F5C\u4E1A\u9879\u6570": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B2",
      "\u7528\u6C34\u91CF": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B2",
      "\u8017\u6750\u9886\u7528": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B2",
      "\u8D28\u68C0\u4EBA\u5458": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B2",
      "\u4F5C\u4E1A\u72B6\u6001": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u8D28\u68C0",
      "pending": false,
      "abnormal": false,
      "\u4F5C\u4E1A\u7F16\u53F7": "CABI-0003",
      "\u822A\u73ED\u53F7": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B3",
      "\u6E05\u6D01\u73ED\u7EC4": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B3",
      "\u4F5C\u4E1A\u9879\u6570": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B3",
      "\u7528\u6C34\u91CF": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B3",
      "\u8017\u6750\u9886\u7528": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B3",
      "\u8D28\u68C0\u4EBA\u5458": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B3",
      "\u4F5C\u4E1A\u72B6\u6001": "\u5BA2\u8231\u6E05\u6D01\u6837\u4F8B3"
    }
  ],
  "team": [
    {
      "id": 1,
      "status": "\u5728\u5C97",
      "pending": false,
      "abnormal": false,
      "\u73ED\u7EC4\u7F16\u53F7": "TEAM-A",
      "\u73ED\u7EC4\u540D\u79F0": "\u7532\u73ED",
      "\u8D1F\u8D23\u533A\u57DF": "\u8FD1\u673A\u4F4D101-104",
      "\u5728\u5C97\u4EBA\u6570": 12,
      "\u73ED\u6B21\u65F6\u6BB5": "\u767D\u73ED 08:00-20:00",
      "\u5E26\u73ED\u4EBA\u5458": "\u738B\u5EFA\u56FD",
      "\u8F6E\u4F11\u5B89\u6392": "\u65E0",
      "\u73ED\u7EC4\u72B6\u6001": "\u5728\u5C97"
    },
    {
      "id": 2,
      "status": "\u5728\u5C97",
      "pending": false,
      "abnormal": false,
      "\u73ED\u7EC4\u7F16\u53F7": "TEAM-B",
      "\u73ED\u7EC4\u540D\u79F0": "\u4E59\u73ED",
      "\u8D1F\u8D23\u533A\u57DF": "\u8FDC\u673A\u4F4D201-205",
      "\u5728\u5C97\u4EBA\u6570": 10,
      "\u73ED\u6B21\u65F6\u6BB5": "\u767D\u73ED 08:00-20:00",
      "\u5E26\u73ED\u4EBA\u5458": "\u674E\u536B\u4E1C",
      "\u8F6E\u4F11\u5B89\u6392": "\u65E0",
      "\u73ED\u7EC4\u72B6\u6001": "\u5728\u5C97"
    },
    {
      "id": 3,
      "status": "\u5728\u5C97",
      "pending": false,
      "abnormal": false,
      "\u73ED\u7EC4\u7F16\u53F7": "TEAM-C",
      "\u73ED\u7EC4\u540D\u79F0": "\u4E19\u73ED",
      "\u8D1F\u8D23\u533A\u57DF": "\u673A\u52A8\u652F\u63F4",
      "\u5728\u5C97\u4EBA\u6570": 8,
      "\u73ED\u6B21\u65F6\u6BB5": "\u767D\u73ED 08:00-20:00",
      "\u5E26\u73ED\u4EBA\u5458": "\u8D75\u6D77\u5CF0",
      "\u8F6E\u4F11\u5B89\u6392": "\u65E0",
      "\u73ED\u7EC4\u72B6\u6001": "\u5728\u5C97"
    }
  ],
  "vehmaint": [
    {
      "id": 1,
      "status": "\u5F85\u8FDB\u5382",
      "pending": true,
      "abnormal": false,
      "\u7EF4\u4FDD\u5355\u53F7": "VEHM-0001",
      "\u8F66\u8F86\u7F16\u53F7": "VEHM-0001",
      "\u7EF4\u4FDD\u7C7B\u578B": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B1",
      "\u8FDB\u5382\u65E5\u671F": "2026-09-01",
      "\u51FA\u5382\u65E5\u671F": "2026-09-01",
      "\u7EF4\u4FEE\u9879\u76EE": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B1",
      "\u627F\u4FEE\u5355\u4F4D": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B1",
      "\u7EF4\u4FDD\u72B6\u6001": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u7EF4\u4FDD\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u7EF4\u4FDD\u5355\u53F7": "VEHM-0002",
      "\u8F66\u8F86\u7F16\u53F7": "VEHM-0002",
      "\u7EF4\u4FDD\u7C7B\u578B": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B2",
      "\u8FDB\u5382\u65E5\u671F": "2026-09-02",
      "\u51FA\u5382\u65E5\u671F": "2026-09-02",
      "\u7EF4\u4FEE\u9879\u76EE": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B2",
      "\u627F\u4FEE\u5355\u4F4D": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B2",
      "\u7EF4\u4FDD\u72B6\u6001": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u9A8C\u6536",
      "pending": false,
      "abnormal": false,
      "\u7EF4\u4FDD\u5355\u53F7": "VEHM-0003",
      "\u8F66\u8F86\u7F16\u53F7": "VEHM-0003",
      "\u7EF4\u4FDD\u7C7B\u578B": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B3",
      "\u8FDB\u5382\u65E5\u671F": "2026-09-03",
      "\u51FA\u5382\u65E5\u671F": "2026-09-03",
      "\u7EF4\u4FEE\u9879\u76EE": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B3",
      "\u627F\u4FEE\u5355\u4F4D": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B3",
      "\u7EF4\u4FDD\u72B6\u6001": "\u7279\u79CD\u8F66\u8F86\u7EF4\u4FDD\u6837\u4F8B3"
    }
  ],
  "vip": [
    {
      "id": 1,
      "status": "\u5F85\u51C6\u5907",
      "pending": true,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "VIP-0001",
      "\u822A\u73ED\u53F7": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B1",
      "\u8981\u5BA2\u7B49\u7EA7": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B1",
      "\u63A5\u5F85\u5355\u4F4D": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B1",
      "\u5F15\u5BFC\u4EBA\u5458": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B1",
      "\u4E13\u7528\u901A\u9053": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B1",
      "\u8F66\u8F86\u5B89\u6392": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B1",
      "\u4FDD\u969C\u72B6\u6001": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u4FDD\u969C\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4FDD\u969C\u7F16\u53F7": "VIP-0002",
      "\u822A\u73ED\u53F7": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B2",
      "\u8981\u5BA2\u7B49\u7EA7": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B2",
      "\u63A5\u5F85\u5355\u4F4D": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B2",
      "\u5F15\u5BFC\u4EBA\u5458": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B2",
      "\u4E13\u7528\u901A\u9053": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B2",
      "\u8F66\u8F86\u5B89\u6392": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B2",
      "\u4FDD\u969C\u72B6\u6001": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u786E\u8BA4",
      "pending": false,
      "abnormal": false,
      "\u4FDD\u969C\u7F16\u53F7": "VIP-0003",
      "\u822A\u73ED\u53F7": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B3",
      "\u8981\u5BA2\u7B49\u7EA7": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B3",
      "\u63A5\u5F85\u5355\u4F4D": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B3",
      "\u5F15\u5BFC\u4EBA\u5458": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B3",
      "\u4E13\u7528\u901A\u9053": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B3",
      "\u8F66\u8F86\u5B89\u6392": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B3",
      "\u4FDD\u969C\u72B6\u6001": "\u8981\u5BA2\u4FDD\u969C\u6837\u4F8B3"
    }
  ],
  "delay": [
    {
      "id": 1,
      "status": "\u5F85\u5904\u7F6E",
      "pending": true,
      "abnormal": false,
      "\u4E8B\u4EF6\u7F16\u53F7": "DELA-0001",
      "\u822A\u73ED\u53F7": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B1",
      "\u5EF6\u8BEF\u539F\u56E0": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B1",
      "\u5F71\u54CD\u65C5\u5BA2\u6570": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B1",
      "\u4FDD\u969C\u63AA\u65BD": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B1",
      "\u5904\u7F6E\u8D1F\u8D23\u4EBA": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B1",
      "\u4E0A\u62A5\u65F6\u95F4": "2026-09-01",
      "\u5904\u7F6E\u72B6\u6001": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u5904\u7F6E\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u4E8B\u4EF6\u7F16\u53F7": "DELA-0002",
      "\u822A\u73ED\u53F7": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B2",
      "\u5EF6\u8BEF\u539F\u56E0": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B2",
      "\u5F71\u54CD\u65C5\u5BA2\u6570": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B2",
      "\u4FDD\u969C\u63AA\u65BD": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B2",
      "\u5904\u7F6E\u8D1F\u8D23\u4EBA": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B2",
      "\u4E0A\u62A5\u65F6\u95F4": "2026-09-02",
      "\u5904\u7F6E\u72B6\u6001": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5DF2\u6062\u590D",
      "pending": false,
      "abnormal": false,
      "\u4E8B\u4EF6\u7F16\u53F7": "DELA-0003",
      "\u822A\u73ED\u53F7": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B3",
      "\u5EF6\u8BEF\u539F\u56E0": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B3",
      "\u5F71\u54CD\u65C5\u5BA2\u6570": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B3",
      "\u4FDD\u969C\u63AA\u65BD": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B3",
      "\u5904\u7F6E\u8D1F\u8D23\u4EBA": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B3",
      "\u4E0A\u62A5\u65F6\u95F4": "2026-09-03",
      "\u5904\u7F6E\u72B6\u6001": "\u5EF6\u8BEF\u5904\u7F6E\u6837\u4F8B3"
    }
  ],
  "apron": [
    {
      "id": 1,
      "status": "\u5F85\u5DE1\u67E5",
      "pending": true,
      "abnormal": false,
      "\u5DE1\u67E5\u7F16\u53F7": "APRO-0001",
      "\u5DE1\u67E5\u533A\u57DF": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B1",
      "\u5DE1\u67E5\u4EBA\u5458": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B1",
      "\u53D1\u73B0\u95EE\u9898\u6570": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B1",
      "\u6574\u6539\u5355\u53F7": "APRO-0001",
      "\u5DE1\u67E5\u65F6\u95F4": "2026-09-01",
      "\u590D\u67E5\u65E5\u671F": "2026-09-01",
      "\u5DE1\u67E5\u72B6\u6001": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u5DE1\u67E5\u4E2D",
      "pending": true,
      "abnormal": true,
      "\u5DE1\u67E5\u7F16\u53F7": "APRO-0002",
      "\u5DE1\u67E5\u533A\u57DF": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B2",
      "\u5DE1\u67E5\u4EBA\u5458": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B2",
      "\u53D1\u73B0\u95EE\u9898\u6570": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B2",
      "\u6574\u6539\u5355\u53F7": "APRO-0002",
      "\u5DE1\u67E5\u65F6\u95F4": "2026-09-02",
      "\u590D\u67E5\u65E5\u671F": "2026-09-02",
      "\u5DE1\u67E5\u72B6\u6001": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5F85\u6574\u6539",
      "pending": false,
      "abnormal": false,
      "\u5DE1\u67E5\u7F16\u53F7": "APRO-0003",
      "\u5DE1\u67E5\u533A\u57DF": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B3",
      "\u5DE1\u67E5\u4EBA\u5458": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B3",
      "\u53D1\u73B0\u95EE\u9898\u6570": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B3",
      "\u6574\u6539\u5355\u53F7": "APRO-0003",
      "\u5DE1\u67E5\u65F6\u95F4": "2026-09-03",
      "\u590D\u67E5\u65E5\u671F": "2026-09-03",
      "\u5DE1\u67E5\u72B6\u6001": "\u673A\u576A\u5B89\u5168\u5DE1\u67E5\u6837\u4F8B3"
    }
  ],
  "resplan": [
    {
      "id": 1,
      "status": "\u5F85\u7F16\u5236",
      "pending": true,
      "abnormal": false,
      "\u8BA1\u5212\u7F16\u53F7": "RESP-0001",
      "\u4FDD\u969C\u65F6\u6BB5": "2026-09-01",
      "\u673A\u4F4D\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B1",
      "\u8F66\u8F86\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B1",
      "\u4EBA\u5458\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B1",
      "\u8D44\u6E90\u7F3A\u53E3": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B1",
      "\u8C03\u5EA6\u4EBA\u5458": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B1",
      "\u8BA1\u5212\u72B6\u6001": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B1"
    },
    {
      "id": 2,
      "status": "\u5F85\u5BA1\u6838",
      "pending": true,
      "abnormal": true,
      "\u8BA1\u5212\u7F16\u53F7": "RESP-0002",
      "\u4FDD\u969C\u65F6\u6BB5": "2026-09-02",
      "\u673A\u4F4D\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B2",
      "\u8F66\u8F86\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B2",
      "\u4EBA\u5458\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B2",
      "\u8D44\u6E90\u7F3A\u53E3": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B2",
      "\u8C03\u5EA6\u4EBA\u5458": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B2",
      "\u8BA1\u5212\u72B6\u6001": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B2"
    },
    {
      "id": 3,
      "status": "\u5DF2\u4E0B\u53D1",
      "pending": false,
      "abnormal": false,
      "\u8BA1\u5212\u7F16\u53F7": "RESP-0003",
      "\u4FDD\u969C\u65F6\u6BB5": "2026-09-03",
      "\u673A\u4F4D\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B3",
      "\u8F66\u8F86\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B3",
      "\u4EBA\u5458\u9700\u6C42": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B3",
      "\u8D44\u6E90\u7F3A\u53E3": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B3",
      "\u8C03\u5EA6\u4EBA\u5458": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B3",
      "\u8BA1\u5212\u72B6\u6001": "\u4FDD\u969C\u8D44\u6E90\u8C03\u5EA6\u6837\u4F8B3"
    }
  ]
};

// src/data/local-store.ts
var STORAGE_KEY = "airport-ground-ops:entries";
var SEED_VERSION = 2;
var VERSION_KEY = "airport-ground-ops:seed-version";
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function seedFallback() {
  return clone(SEED_ROWS);
}
function persist(data) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.localStorage.setItem(VERSION_KEY, String(SEED_VERSION));
  }
}
function readStorage() {
  const fallback = seedFallback();
  if (typeof window === "undefined" || !window.localStorage) {
    return fallback;
  }
  const version = window.localStorage.getItem(VERSION_KEY);
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw || version !== String(SEED_VERSION)) {
    persist(fallback);
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    persist(fallback);
    return fallback;
  }
}
var cache = null;
function allRows() {
  if (cache === null) {
    cache = readStorage();
  }
  return cache;
}
function listRows(key) {
  return allRows()[key] ?? [];
}
function saveRows(key, rows) {
  const next = { ...allRows(), [key]: rows };
  cache = next;
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
}

// src/data/occupancy.ts
var OCCUPANCY_STORAGE_KEY = "airport-ground-ops:occupancy";
var OCCUPANCY_VERSION = 1;
var WINDOW_BEFORE_MIN = 30;
var WINDOW_AFTER_MIN = 90;
var LEVEL_RANK = { \u8981\u5BA2: 0, \u4E00\u7EA7: 1, \u4E8C\u7EA7: 2, \u4E09\u7EA7: 3 };
var KIND_ORDER = { stand: 0, team: 1 };
var claimCache = null;
function parsePlanTime(value) {
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return (/* @__PURE__ */ new Date(`${text}T00:00:00`)).getTime();
  }
  return new Date(text.replace(" ", "T")).getTime();
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function formatStamp(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function formatRange(start, end) {
  return `${formatStamp(start)} ~ ${formatStamp(end)}`;
}
function overlap(a, b) {
  return a.windowStart < b.windowEnd && b.windowStart < a.windowEnd;
}
function backfillOrder(a, b) {
  if (a.windowStart !== b.windowStart) return a.windowStart - b.windowStart;
  const rankA = LEVEL_RANK[a.\u4FDD\u969C\u7B49\u7EA7] ?? 99;
  const rankB = LEVEL_RANK[b.\u4FDD\u969C\u7B49\u7EA7] ?? 99;
  if (rankA !== rankB) return rankA - rankB;
  return a.flightId - b.flightId;
}
function toClaim(row, prior) {
  const plan = String(row["\u8BA1\u5212\u5230\u8FBE"] ?? "");
  const arrival = parsePlanTime(plan);
  return {
    flightId: Number(row.id),
    \u822A\u73ED\u53F7: String(row["\u822A\u73ED\u53F7"] ?? ""),
    \u673A\u4F4D\u53F7: String(row["\u673A\u4F4D\u53F7"] ?? ""),
    \u4FDD\u969C\u73ED\u7EC4: String(row["\u4FDD\u969C\u73ED\u7EC4"] ?? ""),
    \u8BA1\u5212\u5230\u8FBE: plan,
    \u4FDD\u969C\u7B49\u7EA7: String(row["\u4FDD\u969C\u7B49\u7EA7"] ?? ""),
    windowStart: arrival - WINDOW_BEFORE_MIN * 6e4,
    windowEnd: arrival + WINDOW_AFTER_MIN * 6e4,
    holdsStand: false,
    holdsTeam: false,
    conflicts: [],
    accepted: String(row.status) !== "\u5F85\u63A5\u6536",
    source: prior?.source ?? "register"
  };
}
function buildClaims(flights, prior = []) {
  const priorMap = new Map(prior.map((c) => [c.flightId, c]));
  const all = flights.map((row) => toClaim(row, priorMap.get(Number(row.id)))).sort(backfillOrder);
  const ordered = [...all.filter((c) => c.accepted), ...all.filter((c) => !c.accepted)];
  const standHolders = [];
  const teamHolders = [];
  const settled = /* @__PURE__ */ new Map();
  for (const claim of ordered) {
    const evidences = [];
    for (const holder of standHolders) {
      if (holder.\u673A\u4F4D\u53F7 === claim.\u673A\u4F4D\u53F7 && overlap(holder, claim)) {
        evidences.push({ kind: "stand", otherFlightId: holder.flightId, other\u822A\u73ED\u53F7: holder.\u822A\u73ED\u53F7 });
      }
    }
    for (const holder of teamHolders) {
      if (holder.\u4FDD\u969C\u73ED\u7EC4 === claim.\u4FDD\u969C\u73ED\u7EC4 && overlap(holder, claim)) {
        evidences.push({ kind: "team", otherFlightId: holder.flightId, other\u822A\u73ED\u53F7: holder.\u822A\u73ED\u53F7 });
      }
    }
    evidences.sort((x, y) => KIND_ORDER[x.kind] - KIND_ORDER[y.kind] || x.otherFlightId - y.otherFlightId);
    const standConflict = evidences.some((e) => e.kind === "stand");
    const teamConflict = evidences.some((e) => e.kind === "team");
    claim.conflicts = evidences;
    if (claim.accepted) {
      claim.holdsStand = !standConflict;
      claim.holdsTeam = !teamConflict;
      if (claim.holdsStand) standHolders.push(claim);
      if (claim.holdsTeam) teamHolders.push(claim);
    }
    settled.set(claim.flightId, claim);
  }
  return all.map((c) => settled.get(c.flightId));
}
function standTodoText(claim) {
  const standEv = claim.conflicts.find((e) => e.kind === "stand");
  const teamEv = claim.conflicts.find((e) => e.kind === "team");
  const parts = [];
  if (standEv) {
    parts.push(`${claim.accepted ? "\u673A\u4F4D\u8BA9\u4F4D" : "\u5F85\u63A5\u6536\u673A\u4F4D\u51B2\u7A81"}\uFF0C\u649E ${standEv.other\u822A\u73ED\u53F7}`);
  }
  if (teamEv) {
    parts.push(`\u73ED\u7EC4\u65F6\u6BB5\u51B2\u7A81\uFF0C${claim.\u4FDD\u969C\u73ED\u7EC4}\u649E ${teamEv.other\u822A\u73ED\u53F7}`);
  }
  return `${claim.accepted ? "\u8BA9\u4F4D" : "\u5F85\u63A5\u6536"} ${claim.\u822A\u73ED\u53F7}\uFF08\u8BA1\u5212 ${claim.\u8BA1\u5212\u5230\u8FBE}\uFF09\uFF1A${parts.join("\uFF1B")}`;
}
function projectStands(claims) {
  const stands = listRows("stand");
  const next = stands.map((stand) => {
    if (stand.status === "\u7EF4\u62A4\u4E2D" || stand.status === "\u5DF2\u5C01\u95ED") {
      return stand;
    }
    const code = String(stand["\u673A\u4F4D\u7F16\u53F7"] ?? "");
    const mine = claims.filter((c) => c.\u673A\u4F4D\u53F7 === code);
    const holder = mine.filter((c) => c.holdsStand).sort((a, b) => a.windowStart - b.windowStart)[0];
    const todos = mine.filter((c) => c.conflicts.some((e) => e.kind === "stand"));
    const status = holder ? "\u5360\u7528\u4E2D" : "\u7A7A\u95F2";
    return {
      ...stand,
      status,
      pending: Boolean(holder) || todos.length > 0,
      abnormal: false,
      \u5360\u7528\u65F6\u6BB5: holder ? formatRange(holder.windowStart, holder.windowEnd) : "",
      \u5F53\u524D\u822A\u73ED: holder ? holder.\u822A\u73ED\u53F7 : "",
      \u5360\u7528\u5F85\u529E: todos.map(standTodoText).join(" | "),
      \u673A\u4F4D\u72B6\u6001: status
    };
  });
  saveRows("stand", next);
}
function readStoredClaims() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(OCCUPANCY_STORAGE_KEY);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (payload.version !== OCCUPANCY_VERSION || !Array.isArray(payload.claims)) return null;
    return payload.claims;
  } catch {
    return null;
  }
}
function persistClaims(claims) {
  claimCache = claims;
  if (typeof window !== "undefined" && window.localStorage) {
    const payload = { version: OCCUPANCY_VERSION, claims };
    window.localStorage.setItem(OCCUPANCY_STORAGE_KEY, JSON.stringify(payload));
  }
}
function syncFlights(claims, forceWrite) {
  const byId = new Map(claims.map((c) => [c.flightId, c]));
  const flights = listRows("flight");
  let changed = false;
  const next = flights.map((row) => {
    const claim = byId.get(Number(row.id));
    if (!claim) return row;
    const abnormal = claim.conflicts.length > 0;
    const updated = { ...row, abnormal, \u4FDD\u969C\u72B6\u6001: String(row.status) };
    if (updated.abnormal !== row.abnormal || updated.\u4FDD\u969C\u72B6\u6001 !== row["\u4FDD\u969C\u72B6\u6001"]) {
      changed = true;
    }
    return updated;
  });
  if (changed || forceWrite) {
    saveRows("flight", next);
  }
}
function rebuild(markSource) {
  const prior = claimCache ?? readStoredClaims() ?? [];
  if (markSource === "backfill") {
    prior.forEach((c) => {
      c.source = "backfill";
    });
  }
  const claims = buildClaims(listRows("flight"), prior);
  syncFlights(claims, markSource === "backfill");
  projectStands(claims);
  persistClaims(claims);
  return claims;
}
function ensureOccupancy() {
  if (claimCache) return claimCache;
  const stored = readStoredClaims();
  if (stored) {
    claimCache = stored;
    projectStands(stored);
    return stored;
  }
  return rebuild("backfill");
}
function rebuildOccupancy() {
  return rebuild("live");
}
function resetOccupancyLedger() {
  claimCache = null;
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(OCCUPANCY_STORAGE_KEY);
  }
}
function listClaims() {
  return ensureOccupancy();
}
function getClaim(flightId) {
  return listClaims().find((c) => c.flightId === flightId);
}
function previewAccept(flightId) {
  const flights = listRows("flight").map(
    (row) => Number(row.id) === flightId ? { ...row, status: "\u4FDD\u969C\u4E2D" } : row
  );
  return buildClaims(flights, listClaims());
}
function toFlightConflict(claim) {
  const standConflict = claim.conflicts.some((e) => e.kind === "stand");
  const teamConflict = claim.conflicts.some((e) => e.kind === "team");
  return {
    flightId: claim.flightId,
    \u822A\u73ED\u53F7: claim.\u822A\u73ED\u53F7,
    primaryKind: claim.conflicts[0]?.kind ?? "stand",
    evidences: claim.conflicts,
    standConflict,
    teamConflict
  };
}
function conflictReport(flightIds) {
  const scoped = new Set(flightIds);
  const conflicts = listClaims().filter((c) => scoped.has(c.flightId) && c.conflicts.length > 0).map(toFlightConflict);
  const standSide = conflicts.filter((c) => c.standConflict).length;
  const teamSide = conflicts.filter((c) => c.teamConflict).length;
  const bothSide = conflicts.filter((c) => c.standConflict && c.teamConflict).length;
  const standByCode = /* @__PURE__ */ new Map();
  const teamByName = /* @__PURE__ */ new Map();
  for (const c of conflicts) {
    if (c.standConflict) {
      const claim = getClaim(c.flightId);
      const code = claim?.\u673A\u4F4D\u53F7 ?? "";
      standByCode.set(code, (standByCode.get(code) ?? 0) + 1);
    }
    if (c.teamConflict) {
      const claim = getClaim(c.flightId);
      const name = claim?.\u4FDD\u969C\u73ED\u7EC4 ?? "";
      teamByName.set(name, (teamByName.get(name) ?? 0) + 1);
    }
  }
  return { conflicts, total: conflicts.length, standSide, teamSide, bothSide, standByCode, teamByName };
}
export {
  WINDOW_AFTER_MIN,
  WINDOW_BEFORE_MIN,
  backfillOrder,
  buildClaims,
  conflictReport,
  ensureOccupancy,
  getClaim,
  listClaims,
  previewAccept,
  projectStands,
  rebuildOccupancy,
  resetOccupancyLedger
};
