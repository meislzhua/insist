export default [
  {
    layout: false,
    path: '/user/login',
    component: './User/login',
  },
  {
    layout: false,
    path: '/user/register',
    component: './User/register',
  },
  {
    path: '/user/info',
    component: './User/info',
  },
  {
    name: 'startRecord',
    path: '/diary',
    component: './Diary/index',
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
      },
    ],
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './TableList',
  },
  {
    path: '/',
    redirect: '/diary',
  },
  {
    component: './404',
  },
];
