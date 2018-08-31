import { AccountManagerModule } from './account-manager.module';

describe('AccountManagerModule', () => {
  let accountManagerModule: AccountManagerModule;

  beforeEach(() => {
    accountManagerModule = new AccountManagerModule();
  });

  it('should create an instance', () => {
    expect(accountManagerModule).toBeTruthy();
  });
});
