type CommonDimensionKey = 
  | 'make'
  | 'osv' // TODO: delete after migrating advertisement osv targeting
  | 'location'

interface IDimension {
  id: number,
  key: string,
  name?: string,
}

interface IDimensionOption {
  id: number,
  dimensionId: number,
  parentId?: number,
  value: string,
  name?: string,
}

interface IDimensionOptionByDsp {
  id: number,
  value: string,
  name?: string,
  children?: []
}

export { CommonDimensionKey, IDimension, IDimensionOption, IDimensionOptionByDsp };
