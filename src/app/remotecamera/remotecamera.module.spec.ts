import { RemotecameraModule } from './remotecamera.module';

describe('RemotecameraModule', () => {
  let remotecameraModule: RemotecameraModule;

  beforeEach(() => {
    remotecameraModule = new RemotecameraModule();
  });

  it('should create an instance', () => {
    expect(remotecameraModule).toBeTruthy();
  });
});
