import { Injectable, Provider } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class JsonHttpInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (typeof request.body === 'object') {
            request = request.clone({
                responseType: 'json',
                body: JSON.stringify(request.body),
                setHeaders: {
                    'Content-Type': 'application/json',
                    'Accept-Type': 'application/json'
                }});
        }

        return next.handle(request);
    }
}

export const JsonHttpInterceptorProvider: Provider = {
    provide: HTTP_INTERCEPTORS,
    useClass: JsonHttpInterceptor,
    multi: true
};
