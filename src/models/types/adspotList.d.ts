import { ListQueryPayload } from './common';

interface IAdspot {
  id: number,
  mediaId: number,
  adspotName: string,
  mediaName: string,
  adspotType: string,
  adspotTypeName: string,
  status: number,
  bundleName: string,
  platformType?: number,
}

type SortKey = 'id';
type AdspotFilter = {
  searchText?: string,
  status?: 0 | 1,
  adspotType?: number[],
  mediaIds?: number
};

type IAdspotListQueryPayload = ListQueryPayload<AdspotFilter, SortKey>;

export { IAdspot, SortKey, AdspotFilter, IAdspotListQueryPayload };
