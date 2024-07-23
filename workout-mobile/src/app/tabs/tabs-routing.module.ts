import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { CalendarComponent } from '../pages/calendar/calendar.component';
import { WorkoutComponent } from '../pages/workout/workout.component';

const routes: Routes = [
  { 
    path: '',
    component: TabsComponent,
    children: [
      {
        path: 'calendar',
        component: CalendarComponent
      },
      {
        path: 'workout',
        component: WorkoutComponent
      },
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule { }
