import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFriendsPageComponent } from './new-friends-page.component';

describe('NewFriendsPageComponent', () => {
  let component: NewFriendsPageComponent;
  let fixture: ComponentFixture<NewFriendsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewFriendsPageComponent]
    });
    fixture = TestBed.createComponent(NewFriendsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
