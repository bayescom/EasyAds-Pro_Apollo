import type { ParamsType } from '@ant-design/pro-provider';
import ProTable, { ProTableProps } from '@ant-design/pro-table';
import { Button } from 'antd';
import { Link } from 'ice';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ListPage<T extends Record<string, any>, U extends ParamsType>(props: ProTableProps<T, U> & {
  request?: ProTableProps<T, U>['request'],
  columns: ProTableProps<T, U>['columns'],
  pathForCreate?: string,
  labelForCreate?: string,
}) {
  return (
    <ProTable<T>
      rowKey="id"
      search={{
        collapsed: false,
        labelWidth: 'auto',
        optionRender: false
      }}
      form={{
        className: 'list-filter-form',
        span: { xs: 24, sm: 24, md: 8, lg: 6, xl: 6, xxl: 6 }
      }}
      options={false}
      headerTitle={ props.headerTitle
        || props.pathForCreate
          && <Link key="new" to={props.pathForCreate}>
            <Button key="primary" type="primary">
              添加
              {props.labelForCreate || '新建'}
            </Button>
          </Link>
      }
      pagination={{ defaultPageSize: 20 }}
      {...props}
    />
  );
}

export default ListPage;
