import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard.component';
import { AdminPanelComponent } from './dashboard/admin-panel/admin-panel.component';
import { RestaurantCrudPanelComponent } from './dashboard/admin-panel/restaurant-crud-panel/restaurant-crud-panel.component';
import { RestaurantCreateComponent } from './dashboard/admin-panel/restaurant-crud-panel/restaurant-create/restaurant-create.component';
import { RestaurantUpdateComponent } from './dashboard/admin-panel/restaurant-crud-panel/restaurant-update/restaurant-update.component';
import { RestaurantUpdateFormComponent } from './dashboard/admin-panel/restaurant-crud-panel/restaurant-update/restaurant-update-form.component';
import { RestaurantDeleteComponent } from './dashboard/admin-panel/restaurant-crud-panel/restaurant-delete/restaurant-delete.component';
import { CategoryCrudPanelComponent } from './dashboard/admin-panel/category-crud-panel/category-crud-panel.component';
import { CategoryCreateComponent } from './dashboard/admin-panel/category-crud-panel/category-create/category-create.component';
import { CategoryUpdateComponent } from './dashboard/admin-panel/category-crud-panel/category-update/category-update.component';
import { CategoryUpdateFormComponent } from './dashboard/admin-panel/category-crud-panel/category-update/category-update-form.component';
import { CategoryDeleteComponent } from './dashboard/admin-panel/category-crud-panel/category-delete/category-delete.component';
import { UserCrudPanelComponent } from './dashboard/admin-panel/user-crud-panel/user-crud-panel.component';
import { UserCreateComponent } from './dashboard/admin-panel/user-crud-panel/user-create/user-create.component';
import { UserUpdateComponent } from './dashboard/admin-panel/user-crud-panel/user-update/user-update.component';
import { UserUpdateFormComponent } from './dashboard/admin-panel/user-crud-panel/user-update/user-update-form.component';
import { UserDeleteComponent } from './dashboard/admin-panel/user-crud-panel/user-delete/user-delete.component';
import { RoleGuard } from './auth/role.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard/admin-panel/user',
    component: UserCrudPanelComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'dashboard/admin-panel/user/create',
    component: UserCreateComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'dashboard/admin-panel/user/update',
    component: UserUpdateComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'dashboard/admin-panel/user/update/:id',
    component: UserUpdateFormComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'dashboard/admin-panel/user/delete',
    component: UserDeleteComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['Admin'] },
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'dashboard/user', component: UserDashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/admin-panel', component: AdminPanelComponent, canActivate: [AuthGuard] },
  {
    path: 'dashboard/admin-panel/restaurant',
    component: RestaurantCrudPanelComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/restaurant/create',
    component: RestaurantCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/restaurant/update',
    component: RestaurantUpdateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/restaurant/update/:id',
    component: RestaurantUpdateFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/restaurant/delete',
    component: RestaurantDeleteComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/category',
    component: CategoryCrudPanelComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/category/create',
    component: CategoryCreateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/category/update',
    component: CategoryUpdateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/category/update/:id',
    component: CategoryUpdateFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard/admin-panel/category/delete',
    component: CategoryDeleteComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
];
