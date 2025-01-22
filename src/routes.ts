import { IRouterConfig, lazy } from 'ice';
import Layout from '@/Layouts/BasicLayout';
import RouteGuard from './components/hoc/RouteGuard';

const NotFound = lazy(() => import('@/components/NotFound'));
const MediumList = lazy(() => import('@/pages/Medium'));
const AdspotList = lazy(() => import('@/pages/Adspot'));
const MediumNew = lazy(() => import('@/pages/Medium/new'));
const MediumEdit = lazy(() => import('@/pages/Medium/edit'));
const ChannelList = lazy(() => import('@/pages/Channel'));
const Login = lazy(() => import('@/pages/Login'));
const Distribution = lazy(() => import('@/pages/Distribution'));
const ReportMedium = lazy(() => import('@/pages/ReportMedium'));
const AdspotNew = lazy(() => import('@/pages/Adspot/new'));
const AdspotEdit = lazy(() => import('@/pages/Adspot/edit'));
const User = lazy(() => import('@/pages/User'));
const AppVersion = lazy(() => import('@/pages/AppVersion'));
const SdkVersion = lazy(()=> import('@/pages/SdkVersion'));

const routerConfig: IRouterConfig[] = [
  {
    path: '/login',
    component: Login,
    wrappers: [RouteGuard],
  },
  {
    path: '/',
    redirect: '/dashboard',
    component: Layout,
    wrappers: [RouteGuard],
    children: [
      {
        path: '/traffic/media',
        component: MediumList,
      },
      {
        path: '/traffic/adspot',
        component: AdspotList,
      },
      {
        path: '/traffic/list/adspot/new',
        component: AdspotNew,
      },
      {
        path: '/traffic/list/adspot/:id/edit',
        component: AdspotEdit,
      },
      {
        path: '/traffic/distribution/:adspot_id?',
        component: Distribution
      },
      {
        path: '/traffic/list/media/new',
        component: MediumNew,
      },
      {
        path: '/traffic/list/media/:id/edit',
        component: MediumEdit,
      },
      {
        path: '/traffic/channel',
        component: ChannelList,
      },
      {
        path: '/data_report/media_report',
        component: ReportMedium,
      },
      {
        path: '/company/user',
        component: User,
      },
      {
        path: '/version_app',
        component: AppVersion,
      },
      {
        path: '/version_sdk',
        component: SdkVersion,
      },
      {
        path: '/404',
        component: NotFound
      }
    ],
  }
];

export default routerConfig;
