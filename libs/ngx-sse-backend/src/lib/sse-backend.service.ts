import {
  HttpBackend,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  EventSourceMessage,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import { Observable, Subject, filter, finalize, map } from 'rxjs';

export type SseMessage = EventSourceMessage;

/**
 * SseBackend is an Angular HttpBackend implementation that handles Server-Sent Events (SSE).
 * It overrides the `handle` method to provide a stream of events using the EventSource API.
 */
@Injectable()
export class NgxSseBackend extends HttpBackend {
  /**
   * Handles HTTP requests by establishing an SSE connection to the server.
   * Returns an Observable stream of HttpEvents, each representing an SSE message.
   *
   * @param req HttpRequest object representing the outgoing request.
   * @returns An Observable stream of HttpEvents representing SSE messages.
   */
  override handle<T extends SseMessage>(
    req: HttpRequest<unknown>
  ): Observable<HttpEvent<T>> {
    const eventSourceController = new AbortController();

    fetchEventSource(req.urlWithParams, {
      method: req.method,
      headers: this.convertHeadersForSse(req.headers),
      body: req.serializeBody(),
      credentials: req.withCredentials ? 'include' : 'omit',
      onclose: () => eventStream.complete(),
      onerror: (error) => eventStream.error(error),
      onmessage: (message) => eventStream.next(message as T),
      signal: eventSourceController.signal,
      keepalive: true,
      openWhenHidden: true,
    });

    const eventStream = new Subject<T>();

    return eventStream.pipe(
      // Filter messages that don't have an event type.
      filter((message) => !!message.event),

      map(
        (message) =>
          new HttpResponse<T>({
            body: message,
            url: req.url,
            status: 200,
            statusText: 'OK',
          })
      ),
      finalize(() => eventSourceController.abort())
    );
  }

  /**
   * Converts Angular HttpRequest headers to a format suitable for the fetchEventSource function.
   *
   * @param headers HttpRequest object containing headers to be mapped.
   * @returns Record<string, string> Object representing the headers in key-value pairs.
   */
  private convertHeadersForSse(headers: HttpHeaders): Record<string, string> {
    return headers.keys().reduce(
      (result, name) => ({ ...result, [name]: headers.get(name) }),
      // SSE messages are always sent as JSON.
      {
        'Content-Type': 'application/json',
      }
    );
  }
}
