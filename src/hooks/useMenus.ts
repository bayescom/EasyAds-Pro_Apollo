import store from '@/store';

const loopMenuItem = (menus) =>
  menus.map(({ children, ...item }) => {
    return children && children.length > 0 ? { ...item, children: loopMenuItem(children) } : { ...item };
  });

/**
 * @returns Menu items that current user can access 
 */
export default function () {
  const tokenState = store.useModelState('token');

  if (!tokenState.user.id) {
    return [];
  }

  return loopMenuItem(tokenState.routerList);
}
