// 因为要做运算，所以后端返回了字段的浮点数bidRatefloat，但是 dataTargetOperationState.pageDataTarget 存的是 bidRate，因此需要转一下
export const dataMapToFloat = {
  'bid': 'bid',
  'bidRate': 'bidRateFloat',
  'bidWin': 'bidWin',
  'bidWinRate': 'bidWinRateFloat',
  'click': 'click',
  'clickRate': 'clickRateFloat',
  'ecpc': 'ecpc',
  'ecpm': 'ecpm',
  'imp': 'imp',
  'impRate': 'impRateFloat',
  'income': 'income',
  'req': 'req',
  'reqEcpm': 'reqEcpm'
};

export const dataDimension = ['bid', 'bidRate', 'bidWin', 'bidWinRate', 'click', 'clickRate', 'ecpc', 'ecpm', 'imp', 'impRate', 'income', 'req', 'reqEcpm'];

