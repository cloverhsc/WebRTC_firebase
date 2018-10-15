import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaWDataComponent } from './media-w-data.component';

describe('MediaWDataComponent', () => {
  let component: MediaWDataComponent;
  let fixture: ComponentFixture<MediaWDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaWDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaWDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
