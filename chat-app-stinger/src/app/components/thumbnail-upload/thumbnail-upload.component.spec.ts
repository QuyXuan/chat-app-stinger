import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailUploadComponent } from './thumbnail-upload.component';

describe('ThumnailUploadComponent', () => {
  let component: ThumbnailUploadComponent;
  let fixture: ComponentFixture<ThumbnailUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThumbnailUploadComponent]
    });
    fixture = TestBed.createComponent(ThumbnailUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
