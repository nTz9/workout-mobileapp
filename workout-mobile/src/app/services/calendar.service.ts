import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventsCache = new Map<string, any[]>(); // Cache pentru evenimentele pe zile
  private monthCache = new Set<string>(); // Cache pentru lunile deja încărcate
  private selectedDayEvents = new BehaviorSubject<any[]>([]);

  private firestore: Firestore;

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

    return events;
  }

  // Metodă pentru adăugarea unui eveniment în Firestore
  async addEvent(event: any): Promise<void> {
    const docRef = collection(this.firestore, 'calendar');
    await addDoc(docRef, event);
  }

  // Metodă pentru formatarea unei date în format YYYY-MM-DD
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
