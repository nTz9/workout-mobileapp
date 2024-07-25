import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private firestore: Firestore;
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.firestore = getFirestore();
    this.dbPromise = this.initIndexedDB();
  }

  private async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EventsDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('eventsCache', { keyPath: 'date' });
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private async saveToIndexedDB(date: string, data: any[]) {
    const db = await this.dbPromise;
    const transaction = db.transaction('eventsCache', 'readwrite');
    const store = transaction.objectStore('eventsCache');
    store.put({ date, data });

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async getFromIndexedDB(date: string): Promise<any[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction('eventsCache', 'readonly');
    const store = transaction.objectStore('eventsCache');
    const request = store.get(date);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data || []);
      request.onerror = () => reject(request.error);
    });
  }

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

    // Save to IndexedDB
    for (const [date, data] of Object.entries(events)) {
      await this.saveToIndexedDB(date, data);
    }

    return events;
  }

  async getEventsForMonth(viewDate: Date): Promise<{ [key: string]: any[] }> {
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    const cachePromises = [];

    // Check if events are already in IndexedDB
    for (let d = startOfMonth; d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const date = this.formatDate(new Date(d));
      cachePromises.push(this.getFromIndexedDB(date).then(data => ({ date, data })));
    }

    const cacheResults = await Promise.all(cachePromises);
    const events: { [key: string]: any[] } = {};

    cacheResults.forEach(result => {
      if (result.data.length > 0) {
        events[result.date] = result.data;
      }
    });

    // If there are no events in cache, load from Firestore
    if (Object.keys(events).length === 0) {
      return this.loadEventsForMonth(viewDate);
    }

    return events;
  }

  async getEventsForDay(date: Date): Promise<any[]> {
    const formattedDate = this.formatDate(date);
    const cacheData = await this.getFromIndexedDB(formattedDate);
    
    if (cacheData.length > 0) {
      return cacheData;
    } else {
      return [];
    }
  }

  async addEvent(event: any): Promise<void> {
    const docRef = collection(this.firestore, 'calendar');
    await addDoc(docRef, event);
    const date = this.formatDate(new Date(event.timestamp));
    const existingData = await this.getFromIndexedDB(date);
    existingData.push(event);
    await this.saveToIndexedDB(date, existingData);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
