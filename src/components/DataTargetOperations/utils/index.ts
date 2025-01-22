// 弹窗基础数据
export const dataTargetArray = [
  {
    key: 'statistics',
    title: '统计数据',
    children: [
      {
        key: 'incomeData',
        title: '收益数据',
        children: [
          {
            value: 'income',
            title: '预估收益'
          },
          {
            value: 'ecpm',
            title: 'eCPM(¥)'
          },
          {
            value: 'ecpc',
            title: 'eCPC(¥)'
          }
        ]
      },
      {
        key: 'reqData',
        title: '请求展示',
        children: [
          {
            value: 'req',
            title: '请求'
          },
          {
            value: 'bid',
            title: '返回'
          },
          {
            value: 'bidRate',
            title: '填充率'
          },
          {
            value: 'bidWin',
            title: '竞胜数'
          },
          {
            value: 'bidWinRate',
            title: '竞胜率'
          },
          {
            value: 'imp',
            title: '展示'
          },
          {
            value: 'impRate',
            title: '展示率'
          },
          {
            value: 'click',
            title: '点击'
          },
          {
            value: 'clickRate',
            title: '点击率'
          },
        ]
      },
    ]
  },
  {
    key: 'third',
    title: '三方拉取数据',
    children: [
      {
        key: 'incomeData',
        title: '收益数据',
        children: [
          {
            value: 'thirdIncome',
            title: '三方预估收益'
          },
          {
            value: 'thirdEcpm',
            title: '三方eCPM(¥)'
          },
          {
            value: 'thirdEcpc',
            title: '三方eCPC(¥)'
          }
        ]
      },
      {
        key: 'reqData',
        title: '请求展示',
        children: [
          {
            value: 'thirdReq',
            title: '三方请求'
          },
          {
            value: 'thirdBid',
            title: '三方返回'
          },
          {
            value: 'thirdBidRate',
            title: '三方填充率'
          },
          {
            value: 'thirdImp',
            title: '三方展示'
          },
          {
            value: 'thirdImpRate',
            title: '三方展示率'
          },
          {
            value: 'thirdClick',
            title: '三方点击'
          },
          {
            value: 'thirdClickRate',
            title: '三方点击率'
          },
        ]
      },
    ]
  },
  {
    key: 'gap',
    title: '数据Gap率',
    children: [
      {
        key: 'reqData',
        title: '请求展示',
        children: [
          {
            value: 'gapReqPercent',
            title: '请求Gap率'
          },
          {
            value: 'gapBidPercent',
            title: '返回Gap率'
          },
          {
            value: 'gapImpPercent',
            title: '展现Gap率'
          },
          {
            value: 'gapClickPercent',
            title: '点击Gap率'
          }
        ]
      }
    ]
  }
];

export const formatValueList = (data) => {
  return data.map(item => item.value);
};
