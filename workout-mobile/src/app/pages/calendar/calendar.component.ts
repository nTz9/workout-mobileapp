import { Component, OnInit } from '@angular/core';
import { CalendarService } from 'src/app/services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent  implements OnInit {
  viewDate: Date = new Date(); // Data curentă pentru vizualizare
  days: (Date | null)[] = []; // Inițializare corectă
  selectedDay: Date | null = null; // Ziua selectată
  isModalOpen: boolean = false;
  trainingType: string = '';
  exercise: string = '';
  sets: { weight: number, reps: number }[] = []; // Seturi pentru exercițiu
  events: { [key: string]: any[] } = {}; // Evenimentele per zi

  constructor(private calendarService: CalendarService) {}

  ngOnInit() {
    this.loadCalendar();
  }

  // Încărcați calendarul pentru luna curentă
  loadCalendar() {
    const startOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const endOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
    this.days = [];

    // Zile înainte de începutul lunii
    const startDay = startOfMonth.getDay();
    for (let i = 0; i < startDay; i++) {
      this.days.push(null);
    }

    // Zilele din luna curentă
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      this.days.push(new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), i));
    }

    // Zile după sfârșitul lunii
    const totalCells = this.days.length + (7 - (this.days.length % 7));
    for (let i = this.days.length; i < totalCells; i++) {
      this.days.push(null);
    }

    this.loadEvents();
  }

  // Încărcați evenimentele din Firestore
  async loadEvents() {
    this.events = await this.calendarService.loadEventsForMonth(this.viewDate);
  }

  // Formatează data în format YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Navigați la luna precedentă
  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.loadCalendar();
  }

  // Navigați la luna următoare
  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.loadCalendar();
  }

  // Selectați o zi
  selectDay(day: Date) {
    this.selectedDay = day;
  }

  // Verifică dacă ziua este selectată
  isSelected(day: Date): boolean {
    if (this.selectedDay === null) {
      return false;
    }
    return this.formatDate(this.selectedDay) === this.formatDate(day);
  }

  // Adăugați un set
  addSet() {
    this.sets.push({ weight: 0, reps: 0 });
  }

  // Ștergeți un set
  removeSet(index: number) {
    this.sets.splice(index, 1);
  }

  // Adăugați un antrenament
  async addItem() {
    if (this.selectedDay) {
      try {
        await this.calendarService.addEvent({
          timestamp: this.selectedDay,
          trainingType: this.trainingType,
          exercise: this.exercise,
          sets: this.sets
        });
        this.trainingType = '';
        this.exercise = '';
        this.sets = [];
        this.loadEvents(); // Încărcați evenimentele după adăugare
      } catch (error) {
        console.error("Eroare la adăugarea antrenamentului: ", error);
      }
    }
  }

  // Anulați adăugarea unui antrenament
  cancelAdd() {
    this.selectedDay = null;
    this.trainingType = '';
    this.exercise = '';
    this.sets = [];
  }

  // Deschideți modalul pentru adăugare antrenament
  openAddWorkoutModal() {
    this.isModalOpen = true;
  }

  // Închideți modalul pentru adăugare antrenament
  closeAddWorkoutModal() {
    this.isModalOpen = false;
    this.trainingType = '';
    this.exercise = '';
    this.sets = [];
  }
}
