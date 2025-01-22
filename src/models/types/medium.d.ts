import { ListQueryPayload as CommonListQueryPayload } from './common';

interface IMedium {
  id: number,
  platformType: number,
  platformTypeName: string,
  mediaName: string,
  bundleName: string,
  status: number,
  adspotCount: number,
  userList,
  createDate: string,
}

type SortKey = 'id' | 'platformType' | 'status';
type MediumFilter = {
  searchText: string,
  platform: number,
  status: 'all' | 'true'
};

type IMediumListQueryPayload = CommonListQueryPayload<MediumFilter, SortKey>;

export { IMedium, SortKey, MediumFilter, IMediumListQueryPayload };
