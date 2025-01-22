type VersionType = 'app' | 'sdk';

interface IVersion {
  name: string,
  value: string
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
