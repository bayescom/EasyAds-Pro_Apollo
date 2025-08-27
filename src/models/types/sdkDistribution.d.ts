import { ITargetingItem } from './common';

interface IPercentage {
  // 分组的名称
  expId: string | number,
  expName: string | null,
  trafficPercentage: TrafficPercentageType,
  // 分组
  trafficGroupList: TrafficGroupType []
}

type TrafficPercentageType = {
  percentageId: number,
  tag: string,
  status: number,
  percentage: number | string,
  copyPercentageId?: null | number,
  copy?: boolean | null,
  copyPercentageTag?: string | null,
  weight?: number
}

// 这个是 瀑布流的 ab 测试
type TargetPercentageListType = {
  percentage: number | string,
  status: number,
  tag: string,
  targetPercentageId: number | null,
  copyPercentageTag?: string | null,
  copy?: boolean | null,
  copyTargetPercentageId?: null | number | undefined,
}

type ExperimentType = {
  expId: string | number,
  expName: string | null,
}

// 这个是瀑布流的新建或者更新分组的时候传给后端的对象
type TargetPercentageObjByWaterfall = {
  experiment: ExperimentType,
  targetPercentageList: TargetPercentageListType []
}

// 这个是流量分组的新建或者更新分组的时候传给后端的对象
type TargetPercentageObj = {
  experiment: ExperimentType,
  trafficPercentageList: TrafficPercentageType []
}

type TrafficGroupType = {
  // 分策略
  groupStrategy: GroupStrategyType,
  expId: string | number,
  expName: string | null,
  targetPercentageStrategyList: TargetPercentageStrategyListType[]
}

type TargetPercentageStrategyListType = {
  trafficId: number,
  suppliers: number[][],
  sdkSuppliers: sdkSuppliers,
  targetPercentage: TargetPercentage
}

type TargetPercentage = {
  tag: string,
  percentage: number | string,
  targetPercentageId: number,
  status: number
}

type GroupStrategyType = {
  groupTargetId: number,
  name: string,
  priority: number,
  direction: directionType,
  customerDirection: CustomerDirectionType []
}

type CustomerDirectionType = {
  dimensionId: number, 
  property: string,
  valueIdList: []
}

type directionType = {
  appVersion: direction,
  devicePackage: direction,
  sdkVersion: direction,
  location: direction,
  osv: direction,
  maker: direction,
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
  TargetPercentageListType,
  TargetPercentageStrategyListType,
  sdkSuppliers,
  TargetPercentageObjByWaterfall,
  TargetPercentageObj,
  CustomerDirectionType
};
