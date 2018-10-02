import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TryRtcdatachannelComponent } from './try-rtcdatachannel.component';

describe('TryRtcdatachannelComponent', () => {
  let component: TryRtcdatachannelComponent;
  let fixture: ComponentFixture<TryRtcdatachannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TryRtcdatachannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TryRtcdatachannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
