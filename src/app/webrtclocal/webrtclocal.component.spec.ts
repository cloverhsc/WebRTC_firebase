import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebrtclocalComponent } from './webrtclocal.component';

describe('WebrtclocalComponent', () => {
  let component: WebrtclocalComponent;
  let fixture: ComponentFixture<WebrtclocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebrtclocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebrtclocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
