Angular OAuth Client
=========

Angular module for authenticate to OAuth API backends.


## Install

```npm install --save git+https://bitbucket.org/hub9/angular-oauth-client.git```


## Configure


```
#!typescript

...
import { AuthModule } from 'angular-oauth-client';

@NgModule({
  ...
  imports: [
    ...
    AuthModule.forRoot(myApiId, myApiSecret, myApiUrl),
    ...
  ],
  ...
})
export class AppModule { }
```



## Usage


```
#!typescript

import { AuthService } from 'angular-oauth-client';

@Component({...});
export class MyComponent {
  constructor(private auth: AuthService) { }

  login(username, password) {
    this.auth.login(username, password).subscribe(response => {
      console.log("Auth data = ", response);
    });
  }

  logout() {
    this.auth.logout();
    // Do something
  }

  http_requests() {
    // Do a GET request using authentication headers
    this.auth.get("myresource/1/").subscribe(data => console.log(data));

    // Do a POST request using authentication headers and sending data
    this.auth.post("myresource/", {name: 'name'}).subscribe(data => console.log(data));

    // Do a PUT request using authentication headers and sending data
    this.auth.put("myresource/1/", {name: 'name'}).subscribe(data => console.log(data));

    // Do a DELETE request using authentication headers
    this.auth.delete("myresource/1/").subscribe(() => console.log("deleted"));
  }
}
```