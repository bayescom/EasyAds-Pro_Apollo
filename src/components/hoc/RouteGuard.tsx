import store from '@/store';
import { Redirect, useLocation } from 'ice';
import { Location } from 'history';
import { useEffect } from 'react';
import { routerPermissionsPathList } from '@/Layouts/utils';

const specialRoutes = new Set(['/login']);

const pathList = [
  { path: '/traffic/list/media', fatherKey: '/traffic/media' },
  { path: '/traffic/list/adspot', fatherKey: '/traffic/adspot' },
  {path: '/data_report/ab_report_detail', fatherKey: '/data_report/ab_report'}
];

export default (WrappedComponent) => {
  const RouteGuard = ({ location, ...rest }: {
    location: Location<{ noAuthFallBack?: boolean }>
  }) => {
    const tokenState = store.useModelState('token');
    let redirectPath = '';

    useEffect(() => {
      const apollo = document.getElementById('apollo');
      if (location.pathname.indexOf('/traffic/distribution') == -1) {
        const innerStyle = apollo?.style.cssText;
        if (innerStyle && innerStyle == 'min-width: 1366px;') {
          apollo?.setAttribute('style', 'min-width: 1230px');
        }
      } else {
        apollo?.setAttribute('style', 'min-width: 1366px');
      }
    }, [location.pathname]);

    const permissionList = ['/login', '/404', ...routerPermissionsPathList];

    const currentLocation = useLocation();
    // 找到自身和父级路径
    const exit = pathList.find(item => currentLocation.pathname.indexOf(item.path) !== -1);

    if (!tokenState.user.id) { // 无id，进入登录页
      if (location.pathname !== '/login') {
        redirectPath = '/login';
      }
    } else {
      if (tokenState.routerList.length) {
        if (location.pathname == '/') {
          redirectPath = '/data_report/media_report';
        } else if (exit && permissionList.length && !permissionList.includes(exit?.fatherKey)) {
          // exit存在，permissionList.length存在，父key不存在，所以直接404
          redirectPath = '/404';
        } else if (location.pathname && !['/'].includes(location.pathname) && !permissionList.includes(location.pathname)) {
          // 路径名存在 && 不是/ && 路径数组里没有该路径
          // 没根据二级菜单找到一级菜单
          if (exit && !permissionList.includes(exit?.fatherKey)) {
            redirectPath = '/404';
          } else if (!permissionList.includes(location.pathname) && !permissionList.includes(exit?.fatherKey as string)) {
            // 这里是不包含的，且不是主页, 路径数组无一级菜单，且二级菜单的父级菜单也不存在于路径数组permissionList
            redirectPath = '/404';
          }
        } else if (specialRoutes.has(location.pathname)) { // 普通用户访问特殊页面，进入常规页面 这里是每次必然第一次进判断的
          if (tokenState.routerList.length) {
            redirectPath = '/data_report/media_report';
          }
        }
      } else {
        // 只有当用户手动在地址栏输入/或删除/及以后，才默认送到权限路径第一条
        if (['/', '/dashboard'].includes(location.pathname)) {
          redirectPath = '/data_report/media_report';
        }
      }
    }

    if (redirectPath) { // 有值表示当前用户与当前路由不匹配
      return <Redirect to={redirectPath} />;
    }

    // 正常渲染当前路由
    return (<WrappedComponent location={location} {...rest} />);
  };

  RouteGuard.displayName = 'RouteGuardWrapper';

  return RouteGuard;
};
