type VersionType = 'app' | 'sdk';

interface IVersion {
  version: string,
  percent: string
}

type IAppVersion = {
  id: number,
  mediaId: string,
  mediaName: string,
  name: string,
  platformType: number,
  status: number,
}

type VersionFilter = {
  mediaIds?: string,
  searchText?: string,
  status?: number
}

export { IVersion, VersionType, IAppVersion, VersionFilter };
