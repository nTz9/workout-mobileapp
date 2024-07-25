import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private firestore: Firestore;
  private eventsCache: { [key: string]: any[] } = {};

  constructor() {
    this.firestore = getFirestore();
  }

  // Metodă pentru încărcarea evenimentelor din Firestore pentru o lună întreagă
  async loadEventsForMonth(viewDate: Date): Promise<{ [key: string]: any[] }> {
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const q = query(
      collection(this.firestore, 'calendar'),
      where('timestamp', '>=', startOfMonth),
      where('timestamp', '<=', endOfMonth)
    );

    const querySnapshot = await getDocs(q);
    const events: { [key: string]: any[] } = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = this.formatDate(new Date(data['timestamp'].toDate()));
      if (!events[date]) {
        events[date] = [];
      }
      events[date].push(data);
    });

    // Cache events for the current month
    this.eventsCache = events;

    return events;
  }

  // Metodă pentru obținerea evenimentelor pentru o anumită zi din cache
  getEventsForDay(date: Date): any[] {
    const formattedDate = this.formatDate(date);
    return this.eventsCache[formattedDate] || [];
  }

  // Metodă pentru adăugarea unui eveniment în Firestore și actualizarea cache-ului
  async addEvent(event: any): Promise<void> {
    const docRef = collection(this.firestore, 'calendar');
    await addDoc(docRef, event);
    const date = this.formatDate(new Date(event.timestamp));
    if (!this.eventsCache[date]) {
      this.eventsCache[date] = [];
    }
    this.eventsCache[date].push(event);
  }

  // Metodă pentru formatarea unei date în format YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
