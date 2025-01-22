type checkedListMap = {
  incomeData: string[],
  biddingData: string[],
  reqData: string[]
}

type checkAllFlagMap = {
  incomeData: flagMap,
  biddingData: flagMap,
  reqData: flagMap
}

type flagMap = { indeterminate: boolean, checkAll: boolean }

type DragTagList = {
  value: string,
  title: string,
  father: string
}

type DataTargetArray = {
  key: string, 
  title: string,
  children: {
    key: string,
    title: string,
    children: any[]
  }[]
}[]

type dataTargetCheckAllFlagMap = {
  statistics: checkAllFlagMap,
  third: checkAllFlagMap,
  gap: checkAllFlagMap
}

type dataTargetCheckedListMap = {
  statistics: checkedListMap,
  third: checkedListMap,
  gap: checkedListMap
}

export { checkedListMap, checkAllFlagMap, DragTagList, DataTargetArray, dataTargetCheckAllFlagMap, dataTargetCheckedListMap };
