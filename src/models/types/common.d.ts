import { SortOrder } from 'antd/lib/table/interface';
import { Moment } from 'moment';

type BaseModel = Record<string, unknown>;

interface ITargetingItem {
  id?: number,
  key: string,
  operator: number,
  valueSource: number,
  content: string
}

type FilterOption = {
  id: number,
  name: string,
  url?: string,
}

type Sort<T> = {
  [key in T]: SortOrder
}

type Page = {
  current?: number,
  pageSize?: number
}

type ListQueryPayload<Query, SortKey> = {
  params: Query & Page,
  sort: Sort<SortKey>
}

/**
 * 列表接口的排序参数
 */
type SortParams = {
  sort: string,
  dir: 'asc' | 'desc' | null
}

/**
 * 列表接口的分页参数
 */
type PageParams = {
  page: number,
  limit: number
}

interface ICommonState<T> {
  list: T[],
  new?: T,
  editing?: T,
  viewing?: T,
}

interface ICommonMap<T> {
  map: Partial<Record<string, T>>
}

type FilterOptionOfValueNumber = {
  name: string,
  value: number
}

type FilterOptionOfValueString = {
  name: string,
  value: string
}

type FilterOptionHasLabel = {
  label: string,
  value: string
}

type DateType = {
  beginTime: number,
  endTime: number,
}

type LimitType = {
  name: string,
  value: string,
}

type TableParams = {
  page: number,
  limit: number,
  dimensions: string,
  sort: string,
  dir: 'desc' | 'asc'
}

interface FilterForm {
  page: number,
  limit: number,
  searchText?: string
}

type RangeValue = [Moment | null, Moment | null] | null;

type DimensionOption = {
  key: string,
  name: string,
  format?: string,
  disabled?: boolean,
  color: string,
};

type TargetingsVisibility = {
  [key in string]: boolean
}

export {
  BaseModel,
  ListQueryPayload,
  ICommonState,
  ICommonMap,
  ITargetingItem,
  SortParams,
  PageParams,
  FilterOption,
  FilterOptionOfValueNumber,
  FilterOptionOfValueString,
  FilterOptionHasLabel,
  DateType,
  LimitType,
  TableParams,
  FilterForm,
  RangeValue,
  DimensionOption,
  TargetingsVisibility
};
