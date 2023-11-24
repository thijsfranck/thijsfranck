# ngx-sse-backend

`ngx-sse-backend` is an Angular `HttpBackend` implementation designed to handle [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) efficiently. It overrides the Angular `HttpBackend` service to provide a seamless integration of SSE in Angular applications.

## Features

- Seamless integration with Angular's `HttpClientModule`.
- Automatic handling of SSE connections.
- Robust error handling and stream management.

## Usage

To use `ngx-sse-backend` in your Angular application, follow these steps:

### Import `NgxSseBackend`

Import the `NgxSseBackend` class in your Angular module:

```typescript
import { NgxSseBackend } from '@thijsfranck/ngx-sse-backend';
```

### Integrate with Angular's HTTP module

Replace the default `HttpBackend` with `NgxSseBackend`:

```typescript
import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { NgxSseBackend } from '@thijsfranck/ngx-sse-backend';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    { provide: HttpBackend, useClass: NgxSseBackend },
  ],
})
export class AppModule {}
```

> **Note:** By replacing the default `HttpBackend` with the `NgxSseBackend` class, all HTTP requests made in this module will handled as SSE requests. If you also want to make regular HTTP requests, make sure to implement these requests in a separate module. 

### Use with Angular's HttpClient

Now, you can use Angular's `HttpClient` as usual. The observable stream will emit events directly as they are received from the server.

```typescript
import { HttpClient } from '@angular/common/http';

@Component({...})
export class MyComponent {
  constructor(private http: HttpClient) {}

  getSseData() {
    // Print every received event to the console.
    this.http.get('http://example.com/sse').subscribe(data => {
      console.log(data);
    });
  }
}
```

> **Note:** Since we're using the `HttpClient` like usual, any `HttpInterceptor` that you have configured will also be applied. This is great for adding e.g. authentication headers to the SSE request. 

### License

This library is licensed under the MIT License.