import {Routes, RouterModule} from '@angular/router';
import {ProjectListComponent} from "./components/project-list.component";
import {GroupListComponent} from "./components/group-list.component";
import {GroupPageComponent} from "./components/group.page.component";
import {RegisterApplicationFormComponent} from "./components/registerapplicationform.component";
import {MigrationProjectFormComponent} from "./components/migration-project-form.component";
import {ApplicationGroupForm} from "./components/application-group-form.component";
import {AnalysisContextFormComponent} from "./components/analysis-context-form.component";
import {ConfigurationComponent} from "./components/configuration.component";
import {EditApplicationFormComponent} from "./components/edit-application-form.component";
import {ConfirmDeactivateGuard} from "./confirm-deactivate.guard";
import {TechnologiesReport} from "./components/reports/technologies/technologies.report";
import {LoginComponent} from "./components/login.component";
import {LoggedInGuard} from "./services/logged-in.guard";
import {MigrationIssuesComponent} from "./components/reports/migration-issues/migration-issues.component";

const appRoutes: Routes = [
    {path:"", redirectTo: "/project-list", pathMatch: "full", canActivate: [LoggedInGuard]},
    {path:"configuration",          component: ConfigurationComponent, data: {displayName: "Windup Configuration"}, canActivate: [LoggedInGuard]},
    {path:"project-list",           component: ProjectListComponent,   data: {displayName: "Project List"}, canActivate: [LoggedInGuard]},
    {path:"group-list",             component: GroupListComponent,     data: {displayName: "Group List"}, canActivate: [LoggedInGuard]},
    {path:"register-application",   component: RegisterApplicationFormComponent, data: {displayName: "Application Registration"}, canActivate: [LoggedInGuard]},
    {path:"edit-application/:id",   component: EditApplicationFormComponent,     data: {displayName: "Update application"}, canActivate: [LoggedInGuard]},
    {path:"migration-project-form", component: MigrationProjectFormComponent,    data: {displayName: "Edit Project"}, canActivate: [LoggedInGuard]},
    {path:"application-group-form", component: ApplicationGroupForm,             data: {displayName: "Edit Application Group"}, canActivate: [LoggedInGuard]},
    {path:"analysis-context-form",  component: AnalysisContextFormComponent,     data: {displayName: "Edit Analysis Context"}, canActivate: [LoggedInGuard], canDeactivate: [ConfirmDeactivateGuard]},
//    {path:"group-list/:groupID",    component: GroupListComponent, data: {displayName: "Group List"}, canActivate: [LoggedInGuard]},
    {path:"group/:groupID",         component: GroupPageComponent, data: {displayName: "Group"}, canActivate: [LoggedInGuard]},
    {path:"group-list",             component: GroupListComponent, data: {displayName: "Group List"}, canActivate: [LoggedInGuard]},
    {path: "login", component: LoginComponent},

    // Reports
    // :exec refers to the execution ID so that we can use the right graph db.
    {path:"technology-report/:exec", component: TechnologiesReport, data: {displayName: "Technology Report"}, canActivate: [LoggedInGuard]},
    {path: 'reports/:id/migration-issues', component: MigrationIssuesComponent, canActivate: [LoggedInGuard] }
];

/*for (let route of appRoutes){
    route.canActivate = [LoggedInGuard];
}*/

export const appRoutingProviders: any[] = [

];

export const routing = RouterModule.forRoot(appRoutes);
