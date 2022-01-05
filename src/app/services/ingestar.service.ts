import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
// import * as firebase from 'firebase';
// import { Observable } from 'rxjs';
import { Observable, combineLatest, of, Subscription } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { uniq, flatten } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class IngestarService {
  userId: string = '';
  userAuth: boolean = false;
  private userProfile: AngularFirestoreDocument<any>;
  subscription: Subscription;

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
    //console.log('==========getIngeson');
    //console.log(userProfileId);
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
    service_name: string,
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
      service_name: service_name,
      service_tarif: service_tarif,
      total_amount: total_amount,
    });
  }

  getDemandeReservations(userProfileId: string) {
    console.log('getDemandeReservations');
    return this.firestore
      .collection<any>('/reservation', (ref) =>
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

  getPrestationReservations(userProfileId: string) {
    console.log('getPrestationReservations');
    return this.firestore
      .collection<any>('/reservation', (ref) =>
        ref.where('ingeson_id', '==', userProfileId)
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

  getReview(user_from: string, user_to: string): any {
    console.log('get reviews to remove');
    return this.firestore
      .collection<any>('review', (ref) =>
        ref.where('user_to', '==', user_to).where('user_from', '==', user_from)
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

  removeReview(user_from: string, user_to: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.getReview(user_from, user_to).subscribe(
        (reviews) => {
          console.log('Inside reviews');
          console.log(reviews);
          if (reviews && reviews.length > 0) {
            reviews.forEach(async (review) => {
              await this.firestore.doc('review/' + review.id).delete();
            });
            console.log('remove response');
          }
          resolve(true);
        }
      );
    });
  }

  async addReview(
    user_from: string,
    user_from_name: string,
    user_from_image: string,
    user_to: string,
    note: number,
    message: string,
    avg_note: number,
    ingeson_id: string
  ): Promise<any> {
    //Supprimer le review si cela existe deja
    let removeRep = false;
    await this.removeReview(user_from, user_to).then((rep) => {
      this.subscription.unsubscribe();
      removeRep = true;
    });

    if (removeRep) {
      return this.firestore
        .collection('ingeson')
        .doc(ingeson_id)
        .update({
          avg_note: avg_note,
        })
        .then((res) => {
          console.log('update avg_note');
          console.log(res);
          this.firestore.collection<any>('review').add({
            user_from: user_from,
            user_from_name: user_from_name,
            user_from_image: user_from_image,
            user_to: user_to,
            note: note,
            message: message,
          });
        });
    }
  }
}
