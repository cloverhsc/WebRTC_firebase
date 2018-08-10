import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemotecameraComponent } from './remotecamera.component';

describe('RemotecameraComponent', () => {
  let component: RemotecameraComponent;
  let fixture: ComponentFixture<RemotecameraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemotecameraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemotecameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
