import { Routes } from '@angular/router';
import { AuthGuard } from '../modules/auth/services/auth.guard';
import { UpdatePasswordComponent } from '../modules/auth/components/update-password/update-password.component';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'builder',
    loadChildren: () =>
      import('./builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: 'crafted/pages/profile',
    loadChildren: () =>
      import('../modules/profile/profile.module').then((m) => m.ProfileModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'crafted/account',
    loadChildren: () =>
      import('../modules/account/account.module').then((m) => m.AccountModule),
    // data: { layout: 'dark-header' },
  },
  {
    path: 'crafted/pages/wizards',
    loadChildren: () =>
      import('../modules/wizards/wizards.module').then((m) => m.WizardsModule),
    // data: { layout: 'light-header' },
  },
  {
    path: 'crafted/widgets',
    loadChildren: () =>
      import('../modules/widgets-examples/widgets-examples.module').then(
        (m) => m.WidgetsExamplesModule
      ),
    // data: { layout: 'light-header' },
  },
  {
    path: 'apps/chat',
    loadChildren: () =>
      import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
    // data: { layout: 'light-sidebar' },
  },
  {
    path: 'user-management',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'role-list',
    loadChildren: () => import('./role/role.module').then((m) => m.RoleModule),
  },
  {
    path: 'apps/permissions',
    loadChildren: () =>
      import('./permission/permission.module').then((m) => m.PermissionModule),
  },
  {
    path: 'setups',
    loadChildren: () =>
      import('../modules/setup/setup.module').then((m) => m.SetupModule),
  },
  {
    path: 'sms',
    loadChildren: () =>
      import('../modules/sms/sms.module').then((m) => m.SmsModule),
  },
  {
    path: 'email',
    loadChildren: () =>
      import('../modules/email/email.module').then((m) => m.EmailModule),
  },
  {
    path: 'sale',
    loadChildren: () =>
      import('../modules/sale/sale.module').then((m) => m.SaleModule),
  },
  {
    path: 'subscription',
    loadChildren: () =>
      import('../modules/subscription/subscription.module').then(
        (m) => m.SubscriptionModule
      ),
  },
  {
    path: 'bcsubscription',
    loadChildren: () =>
      import('../modules/bcsubscription/bcsubscription.module').then(
        (m) => m.BcsubscriptionModule
      ),
  },
  {
    path: 'activity',
    loadChildren: () =>
      import('../modules/activity/activity.module').then(
        (m) => m.ActivityModule
      ),
  },
  {
    path: 'committee',
    loadChildren: () =>
      import('../modules/committee/committee.module').then(
        (m) => m.CommitteeModule
      ),
  },
  {
    path: 'member',
    loadChildren: () =>
      import('../modules/member/member.module').then((m) => m.MemberModule),
  },
  {
    path: 'memberbc',
    loadChildren: () =>
      import('../modules/memberbc/memberbc.module').then(
        (m) => m.MemberbcModule
      ),
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('../modules/report/report.module').then((m) => m.ReportModule),
  },
  {
    path: 'topup',
    loadChildren: () =>
      import('../modules/topup/topup.module').then((m) => m.TopupModule),
  },
  {
    path: 'board-meeting',
    loadChildren: () =>
      import('../modules/board-meeting/board-meeting.module').then(
        (m) => m.BoardMeetingModule
      ),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'update-password',
    component: UpdatePasswordComponent,
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
