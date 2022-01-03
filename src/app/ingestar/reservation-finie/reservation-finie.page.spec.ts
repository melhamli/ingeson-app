import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReservationFiniePage } from './reservation-finie.page';

describe('ReservationFiniePage', () => {
  let component: ReservationFiniePage;
  let fixture: ComponentFixture<ReservationFiniePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationFiniePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationFiniePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
