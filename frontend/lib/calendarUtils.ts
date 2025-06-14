// lib/calendarUtils.ts
import { db } from '@/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export async function deleteExpiryFromCalendar(name: string, uid: string) {
  const q = query(
    collection(db, 'termine'),
    where('uid', '==', uid)
  );
  const snapshot = await getDocs(q);
  const matches = snapshot.docs.filter((doc) =>
    doc.data().text === `❗ Ablaufdatum: ${name}`
  );

  for (const match of matches) {
    await deleteDoc(doc(db, 'termine', match.id));
  }
}
