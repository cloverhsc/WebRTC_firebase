import { MiscellanyModule } from './miscellany.module';

describe('MiscellanyModule', () => {
  let miscellanyModule: MiscellanyModule;

  beforeEach(() => {
    miscellanyModule = new MiscellanyModule();
  });

  it('should create an instance', () => {
    expect(miscellanyModule).toBeTruthy();
  });
});
