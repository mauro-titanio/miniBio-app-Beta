import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Link } from '../../models/link';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LinksCrudService {

  

  constructor(private fireStore: AngularFirestore) { }




//Crear un objetoo en la collección
newLink(data: any, minibioID:string, userID:string) {
  return this.fireStore.collection('users').doc(userID).collection('minibio').doc(minibioID).collection('user_links').add(data)
  
}
//Leer toda la collección
readAllLinks(userID: string, minibioID:string,){
  return this.fireStore.collection('users').doc(userID).collection('minibio').doc(minibioID).collection('user_links').get()
}
//Leer un link en especifico
getLink(userID:string, minibioID:string,linkID: string ){
  return this.fireStore.collection('users').doc(userID).collection('minibio').doc(minibioID).collection('user_links').doc(linkID).get()
}
//Modificar un link
updateLink(userID:string, minibioID:string, data:Link, linkID: string){
  return this.fireStore.collection('users').doc(userID).collection('minibio').doc(minibioID).collection('user_links').doc(linkID).update(data)
}
//Eliminar un link
deleteLink(userID:string, minibioID:string, linkID:string){
  return this.fireStore.collection('users').doc(userID).collection('minibio').doc(minibioID).collection('user_links').doc(linkID).delete()
}



}
