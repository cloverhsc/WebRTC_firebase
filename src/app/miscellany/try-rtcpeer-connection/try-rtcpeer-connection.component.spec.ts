import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TryRTCPeerConnectionComponent } from './try-rtcpeer-connection.component';

describe('TryRTCPeerConnectionComponent', () => {
  let component: TryRTCPeerConnectionComponent;
  let fixture: ComponentFixture<TryRTCPeerConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TryRTCPeerConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TryRTCPeerConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
