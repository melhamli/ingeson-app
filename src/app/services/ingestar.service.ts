import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
// import * as firebase from 'firebase';
// import { Observable } from 'rxjs';
import { Observable, combineLatest, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { uniq, flatten } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class IngestarService {
  userId: string = '';
  userAuth: boolean = false;
  private userProfile: AngularFirestoreDocument<any>;

  constructor(
    private firestore: AngularFirestore,
    private fireAuth: AngularFireAuth
  ) {}

  //Récuperer tous les services//

  getServices() {
    console.log('start getServices');
    return this.firestore
      .collection<any>('services')
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data();
            // get id from firebase metadata
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  //Récuperer tous les ingénieurs du son d'après un service donné//

  getingesonByService(serviceId: string) {
    console.log('start getingesonByService');
    return this.firestore
      .collection<any>('ingetarif', (ref) =>
        ref.where('service_id', '==', serviceId)
      )
      .snapshotChanges()
      .pipe(
        switchMap((ingetarifs) => {
          const userIds = uniq(
            ingetarifs.map(
              (ingetarif) => ingetarif.payload.doc.data()['userprofile_id']
            )
          );

          return combineLatest(
            of(ingetarifs),
            combineLatest(
              userIds.map((userId) =>
                this.firestore
                  .collection<any>('userProfile', (ref) =>
                    ref.where('id', '==', userId)
                  )
                  .valueChanges()
                  .pipe(map((userProfiles) => userProfiles[0]))
              )
            ),
            combineLatest(
              userIds.map((userId) =>
                this.firestore
                  .collection<any>('ingeson', (ref) =>
                    ref.where('userprofile_id', '==', userId)
                  )
                  .valueChanges()
                  .pipe(map((ingesons) => ingesons[0]))
              )
            )
          );
        }),
        map(([ingetarifs, userProfiles, ingesons]) => {
          return ingetarifs.map((ingetarif) => {
            const data = ingetarif.payload.doc.data();
            // get id from firebase metadata
            const id = ingetarif.payload.doc.id;
            return {
              id,
              ...data,
              userProfile: userProfiles.find(
                (a) => a.id === ingetarif.payload.doc.data()['userprofile_id']
              ),
              ingeson: ingesons.find(
                (a) =>
                  a.userprofile_id ===
                  ingetarif.payload.doc.data()['userprofile_id']
              ),
            };
          });
        })
      );
  }

  //Recuperer les infos sur le profile de l'utilisateur
  getUserProfile(userProfileId: string) {
    return this.firestore
      .doc<any>('userProfile/' + userProfileId)
      .valueChanges();
  }
  //Recuperer les infos sur le profile de l'ingenieur du son associe a l'utilisateur
  getIngeson(userProfileId: string) {
    return this.firestore
      .collection<any>('/ingeson', (ref) =>
        ref.where('userprofile_id', '==', userProfileId)
      )
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  //Recuperer les infos sur les reviews de l'utilisateur
  getReviews(userProfileId: string) {
    return this.firestore
      .collection<any>('review', (ref) =>
        ref.where('user_to', '==', userProfileId)
      )
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data();
            // get id from firebase metadata
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  //Recuperer les infos sur les tarifs des services offerts par un ingenieur du son
  getTarifs(userProfileId: string) {
    return this.firestore
      .collection<any>('ingetarif', (ref) =>
        ref.where('userprofile_id', '==', userProfileId)
      )
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data();
            // get id from firebase metadata
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }
  //Sauvegarder une reservation
  signupUser(
    firstname: string,
    lastname: string,
    phone: string,
    username: string,
    password: string
  ): Promise<any> {
    return this.fireAuth.auth
      .createUserWithEmailAndPassword(username, password)
      .then((newUser) => {
        console.log('userid=========' + newUser.user.uid); // firebase.database().ref('/userProfile').child(newUser.uid).set({
        this.firestore.collection('userProfile').doc(newUser.user.uid).set({
          id: newUser.user.uid,
          firstname: firstname,
          lastname: lastname,
          email: username,
          image: '',
          phone: phone,
        });
      });
  }

  saveReservation(
    userprofile_id: string,
    user_profile_name: string,
    user_profile_image: string,
    ingeson_id: string,
    ingeson_name: string,
    ingeson_image: string,
    nbheure: number,
    date_res: string,
    service_id: string,
    service_tarif: string,
    total_amount: number
  ) {
    return this.firestore.collection<any>('reservation').add({
      userprofile_id: userprofile_id,
      user_profile_name: user_profile_name,
      user_profile_image: user_profile_image,
      ingeson_id: ingeson_id,
      ingeson_name: ingeson_name,
      ingeson_image: ingeson_image,
      nbheure: nbheure,
      date_res: date_res,
      service_id: service_id,
      service_tarif: service_tarif,
      total_amount: total_amount,
    });
  }
}
