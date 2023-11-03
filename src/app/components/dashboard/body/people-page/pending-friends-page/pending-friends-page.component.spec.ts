import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingFriendsPageComponent } from './pending-friends-page.component';

describe('PendingFriendsPageComponent', () => {
  let component: PendingFriendsPageComponent;
  let fixture: ComponentFixture<PendingFriendsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingFriendsPageComponent]
    });
    fixture = TestBed.createComponent(PendingFriendsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
