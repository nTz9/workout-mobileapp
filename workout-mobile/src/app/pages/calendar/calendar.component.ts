import { Component, OnInit } from '@angular/core';
import { addDoc, collection, Firestore, getFirestore } from 'firebase/firestore';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent  implements OnInit {
  private firestore: Firestore;

  constructor() {
    this.firestore = getFirestore(); // Asigură-te că Firestore este corect inițializat
  }

  ngOnInit() {}

  async addItem() {
    try {
      const docRef = collection(this.firestore, 'items'); // Înlocuiește 'items' cu numele colecției tale
      const docId = await addDoc(docRef, {
        name: 'Sample Item',
        description: 'This is a sample item',
        timestamp: new Date()
      });
      console.log('Document written with ID: ', docId.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }
}
