import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVenueBlockedModalComponent } from './new-venue-blocked-modal.component';

describe('NewVenueBlockedModalComponent', () => {
  let component: NewVenueBlockedModalComponent;
  let fixture: ComponentFixture<NewVenueBlockedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewVenueBlockedModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewVenueBlockedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
