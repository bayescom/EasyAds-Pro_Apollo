import { PageParams, SortParams } from '@/models/types/common';
import { SortOrder } from 'antd/lib/table/interface';

const sortOrderMap = {
  descend: 'desc',
  ascend: 'asc'
} as const;

const getSortParams = (sort: Record<string, SortOrder>): SortParams => {
  const sortKey = Object.keys(sort)[0];
  const sortOrder = sort[sortKey];

  return {
    sort: sortKey,
    dir: sortOrder ? sortOrderMap[sortOrder] : null
  };
};

const getPageParams = (params: { pageSize: number, current: number }): PageParams => ({
  page: params.current,
  limit: params.pageSize
});

export {
  getSortParams,
  getPageParams
};
