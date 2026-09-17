// 这个hooks 是为了解决 切换状态不刷新页面（需求就是这样），导致切换页码时后端报 数组越界的问题
import { useRef, useCallback } from 'react';
import { ActionType } from '@ant-design/pro-table';

const useSimplePaginationCorrector = (
  actualTotal: number,
  actionRef: React.MutableRefObject<ActionType | undefined>
) => {
  const correctingRef = useRef(false);

  const wrapRequest = useCallback(<T>(
    originalRequest: (params: any, sort: any) => Promise<T>
  ) => {
    return async (params: any, sort: any): Promise<T> => {
      if (correctingRef.current) {
        correctingRef.current = false;
        return { data: [], success: true, total: actualTotal } as unknown as T;
      }

      const currentPage = params.current || 1;
      const pageSize = params.pageSize || 20;
      const actualTotalPages = Math.ceil(actualTotal / pageSize);
      const correctedPage = Math.min(currentPage, actualTotalPages > 0 ? actualTotalPages : 1);

      if (correctedPage !== currentPage) {
        correctingRef.current = true;
        actionRef.current?.setPageInfo?.({
          current: correctedPage,
          pageSize: pageSize,
        });
        setTimeout(() => actionRef.current?.reload?.(), 50);
        return { data: [], success: true, total: actualTotal } as unknown as T;
      }
      
      return await originalRequest(params, sort);
    };
  }, [actualTotal, actionRef]);

  return wrapRequest;
};

export default useSimplePaginationCorrector;
