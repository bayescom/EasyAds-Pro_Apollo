import { createStore, IStoreModels, IStoreDispatch, IStoreRootState } from 'ice';
import token from './models/token';
import medium from './models/medium';
import adspotList from './models/adspotList';
import adspot from './models/adspot';
import code from './models/code';
import sdkDistribution from './models/sdkDistribution';
import sdkChannel from './models/sdkChannel';
import sdkAdspotChannel from './models/sdkAdspotChannel';
import version from './models/version';
import dimension from './models/dimension';
import reportMedium from './models/reportMedium';
import channel from './models/channel';
import user from './models/user';
import distribution from './models/distribution';
import treeSelect from './models/treeSelect';
import dataTargetOperation from './models/dataTargetOperation';
import appVersion from './models/appVersion';
import sdkVersion from './models/sdkVersion';
import reportAbTest from './models/reportAbTest';
import reportAbTestDetail from './models/reportAbTestDetail';

interface IAppStoreModels extends IStoreModels {
  token: typeof token,
  medium: typeof medium,
  adspotList: typeof adspotList,
  adspot: typeof adspot,
  code: typeof code,
  sdkDistribution: typeof sdkDistribution,
  sdkChannel: typeof sdkChannel
  sdkAdspotChannel: typeof sdkAdspotChannel,
  version: typeof version,
  dimension: typeof dimension,
  reportMedium: typeof reportMedium,
  channel: typeof channel,
  user: typeof user,
  distribution: typeof distribution,
  treeSelect: typeof treeSelect,
  dataTargetOperation: typeof dataTargetOperation,
  appVersion: typeof appVersion,
  sdkVersion: typeof sdkVersion,
  reportAbTest: typeof reportAbTest,
  reportAbTestDetail: typeof reportAbTestDetail
}

const appModels: IAppStoreModels = {
  token,
  medium,
  adspotList,
  adspot,
  code,
  sdkDistribution,
  sdkChannel,
  sdkAdspotChannel,
  version,
  dimension,
  reportMedium,
  channel,
  user,
  distribution,
  treeSelect,
  dataTargetOperation,
  appVersion,
  sdkVersion,
  reportAbTest,
  reportAbTestDetail
};

const store = createStore(appModels);

export default store;
export type IRootDispatch = IStoreDispatch<typeof appModels>;
export type IRootState = IStoreRootState<typeof appModels>;
