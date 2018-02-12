<h1 align="center">
  <img src="assets/logo.svg" />
  <br/>
  Angular OAuth Client
</h1>

Angular module for OAuth API authentication and wrapper for Angular's HTTP Client.


## Install

```bash
$ npm install --save @hub9/angular-oauth-client
```


## Configure

```typescript
// ...
import { AuthModule } from '@hub9/angular-oauth-client';

const apiConfig = {
  apiId: '<Api_Id>',
  apiSecret: '<Api_Secret>',
  apiUrl: 'api/',
  apiOauthUrl: 'oauth/',
  unauthorizedRoute: '/login/',
};

@NgModule({
  // ...
  imports: [
    // ...
    AuthModule.forRoot(apiConfig),
    // ...
  ],
  // ...
})
export class AppModule {}
```

## Usage

```typescript
import { AuthService } from '@hub9/angular-oauth-client';

@Component({...})
export class MyComponent {
  constructor(private auth: AuthService) {}

  login(username, password) {
    this.auth.login(username, password).subscribe(response => {
      console.log('Auth data:', response);
    });
  }

  logout() {
    this.auth.logout();
  }

  httpRequests() {
    // Do a GET request using authentication headers
    this.auth.get('myresource/1/').subscribe(data => console.log(data));

    // Do a POST request using authentication headers and sending data
    this.auth.post('myresource/', { name: 'name' }).subscribe(data => console.log(data));

    // Do a PUT request using authentication headers and sending data
    this.auth.put('myresource/1/', { name: 'name' }).subscribe(data => console.log(data));

    // Do a DELETE request using authentication headers
    this.auth.delete('myresource/1/').subscribe(() => console.log('deleted'));
  }
}
```

## Contribute

```bash
$ git clone https://github.com/hub9co/angular-oauth-client.git
$ cd angular-oauth-client
$ npm install
$ npm run build
```
