import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Link } from '../../models/link';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MinibioCrudService {

  constructor(private fireStore: AngularFirestore) { }

  //Crear un objetoo en la collección
newMinibio(data: any, userID:string) {
  return this.fireStore.collection('users').doc(userID).collection('minibio').add(data)
  
}
//Leer toda la collección
readAllMinibio(userID: string){
  return this.fireStore.collection('users').doc(userID).collection('minibio').get()
}
//Leer un link en especifico
getMinibio(id:string,minibioID: string ){
  return this.fireStore.collection('users').doc(id).collection('minibio').doc(minibioID).get()
}
//Modificar un link
updateMinibio(userID:string, data:Link, minibioID: string){
  return this.fireStore.collection('users').doc(userID).collection('minibio').doc(minibioID).update(data)
}
//Eliminar un link
deleteMinibio(userID:string, minibioID:string){
  return this.fireStore.collection('users').doc(userID).collection('minibio').doc(minibioID).delete()
}

}