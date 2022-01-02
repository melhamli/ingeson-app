import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore,AngularFirestoreCollection,AngularFirestoreDocument} from '@angular/fire/firestore';
// import * as firebase from 'firebase';
// import { Observable } from 'rxjs';
import { Observable, combineLatest, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { uniq, flatten } from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class IngestarService {

  userId: string = "";
  userAuth: boolean = false;
  private userProfile: AngularFirestoreDocument<any>;

  constructor(
    private firestore: AngularFirestore,
    private fireAuth:AngularFireAuth
  ) { 
    
   }

  //Récuperer tous les services//

   getServices(){
    console.log("start getServices");
    return this.firestore.collection<any>('services').snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          // get id from firebase metadata 
          const id = a.payload.doc.id; 
          return { id, ...data };
        });
      })
    );
  
  }

  //Récuperer tous les ingénieurs du son d'après un service donné//

  getingesonByService (serviceId:string){
    console.log("start getingesonByService");
    return this.firestore.collection<any>('ingetarif', ref => ref
  .where('service_id', '==', serviceId)).snapshotChanges()
      .pipe(
        switchMap(ingetarifs => {
          const userIds = uniq(ingetarifs.map(ingetarif => ingetarif.payload.doc.data()["userprofile_id"])) 

          return combineLatest(
            of(ingetarifs),
            combineLatest(
              userIds.map(userId =>
                this.firestore.collection<any>('userProfile', ref => ref.where('id', '==', userId)).valueChanges().pipe(
                  map(userProfiles => userProfiles[0])
                )
              )
            ),
            combineLatest(
              userIds.map(userId =>
                this.firestore.collection<any>('ingeson', ref => ref.where('userprofile_id', '==', userId)).valueChanges().pipe(
                  map(ingesons => ingesons[0])
                )
              )
            )
          )
        }),
        map(([ingetarifs, userProfiles, ingesons]) => {

          return ingetarifs.map(ingetarif => { 
            const data = ingetarif.payload.doc.data();
          // get id from firebase metadata 
          const id = ingetarif.payload.doc.id; 
            return {
              id, ...data,
              userProfile: userProfiles.find(a => a.id === ingetarif.payload.doc.data()["userprofile_id"]), 
              ingeson: ingesons.find(a => a.userprofile_id === ingetarif.payload.doc.data()["userprofile_id"])
            }
          })
        })
      )
  }

  getingesonByServiceold (serviceId:string){
    console.log("start getingesonByService");
    return this.firestore.collection<any>('ingetarif', ref => ref
  .where('service_id', '==', serviceId)).snapshotChanges()
      .pipe(
        switchMap(ingetarifs => {
          const userIds = uniq(ingetarifs.map(ingetarif => ingetarif.payload.doc.data()["userprofile_id"])) 
          console.log(ingetarifs)

          return combineLatest(
            of(ingetarifs),
            combineLatest(
              userIds.map(userId =>
                this.firestore.collection<any>('userProfile', ref => ref.where('id', '==', userId)).valueChanges().pipe(
                  map(userProfiles => userProfiles[0])
                )
              )
            )
          )
        }),
        map(([ingetarifs, userProfiles]) => {

          return ingetarifs.map(ingetarif => { 
            const data = ingetarif.payload.doc.data();
          // get id from firebase metadata 
          const id = ingetarif.payload.doc.id; 
            return {
              id, ...data,
              userProfile: userProfiles.find(a => a.id === ingetarif.payload.doc.data()["userprofile_id"]), 
            }
          })
        })
      )
  }

}

