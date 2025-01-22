interface IPercentage {
  trafficPercentage: TrafficPercentageType,
  // 分组
  trafficGroupList: TrafficGroupType []
}

type TrafficPercentageType = {
  percentageId: number,
  tag: string,
  percentage: number | string,
  copyPercentageId?: null | number,
  copy?: boolean | null,
  copyPercentageTag?: string | null,
  weight?: number
}

type TrafficGroupType = {
  trafficId: number,
  // 分策略
  groupStrategy: GroupStrategyType,
  suppliers: number[][],
  sdkSuppliers: sdkSuppliers
}

type GroupStrategyType = {
  groupTargetId: number,
  name: string,
  priority: number,
  direction: directionType,
}

type directionType = {
  appVersion: direction,
  sdkVersion: direction,
}

type direction = {
  property: string,
  value: []
}

type sdkSuppliers = {
  bidding: number[][],
  waterfall: number[][]
}

interface ISdkDistribution {
  percentageList: IPercentage[],
}

export {
  ISdkDistribution,
  IPercentage,
  GroupStrategyType,
  TrafficGroupType,
  TrafficPercentageType,
  sdkSuppliers
};
