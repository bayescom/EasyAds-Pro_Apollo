const dataList = ['req','bid','imp','click','income','bidRate','impRate','clickRate','ecpm','ecpc','thirdReq','thirdBid','thirdImp','thirdClick','thirdIncome','thirdBidRate','thirdImpRate','thirdClickRate','thirdEcpm','thirdEcpc','gapReqPercent','gapBidPercent','gapImpPercent','gapClickPercent'];

const flattenObj = (obj, result) => {
  return Object.keys(obj).reduce((result, key) => {
    // 非`null`对象递归
    if(Object(obj[key]) === obj[key]) {
      return flattenObj(obj[key], result);
    }       
    result[key] = obj[key];
    return result;
  }, result || {});
};
export function formatChannelFromModal(channelFormData) {
  dataList.forEach(item => {
    for(const key in channelFormData) {
      if (key == item) {
        delete channelFormData[key];
      }
    }
  });
  return channelFormData;
}

export function formatDataPayload(payloadData) {
  payloadData.map(item => {
    flattenObj(item.data, item);
  });
  return payloadData;
}
