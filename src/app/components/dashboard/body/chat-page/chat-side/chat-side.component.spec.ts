import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSideComponent } from './chat-side.component';

describe('ChatSideComponent', () => {
  let component: ChatSideComponent;
  let fixture: ComponentFixture<ChatSideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatSideComponent]
    });
    fixture = TestBed.createComponent(ChatSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
