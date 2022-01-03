import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReservationListPage } from './reservation-list.page';

describe('ReservationListPage', () => {
  let component: ReservationListPage;
  let fixture: ComponentFixture<ReservationListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
