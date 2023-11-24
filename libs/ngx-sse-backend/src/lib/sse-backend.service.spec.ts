import { HttpRequest, HttpResponse } from '@angular/common/http';
import { FetchEventSourceInit } from '@microsoft/fetch-event-source';
import { NgxSseBackend } from './sse-backend.service';

// Create a mock EventSource behavior
const mockEventSource: FetchEventSourceInit = {};

jest.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: jest.fn().mockImplementation((_, settings) => {
    mockEventSource.onmessage = settings.onmessage;
    mockEventSource.onerror = settings.onerror;
    mockEventSource.onclose = settings.onclose;
    mockEventSource.signal = settings.signal;
  }),
}));

describe('ngx-sse-backend', () => {
  let service: NgxSseBackend;

  beforeEach(() => {
    service = new NgxSseBackend();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should handle SSE messages', async () => {
    const fakeReq = new HttpRequest('GET', 'http://example.com/sse');
    const result = service.handle(fakeReq);

    const message = { id: '1', event: 'test', data: 'test message' };
    const onNext = jest.fn();

    result.subscribe(onNext);

    if (mockEventSource.onmessage) mockEventSource.onmessage(message);

    expect(onNext).toHaveBeenCalledWith(
      new HttpResponse({
        body: message,
        status: 200,
        statusText: 'OK',
        url: 'http://example.com/sse',
      })
    );
  });

  it('should handle errors', async () => {
    const fakeReq = new HttpRequest('GET', 'http://example.com/sse');
    const result = service.handle(fakeReq);

    const onError = jest.fn();

    result.subscribe({
      next: () => {},
      error: onError,
    });

    const testError = new Error('Test error');

    if (mockEventSource.onerror) mockEventSource.onerror(testError);

    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should complete the stream on SSE close', async () => {
    const fakeReq = new HttpRequest('GET', 'http://example.com/sse');
    const result = service.handle(fakeReq);

    const onComplete = jest.fn();

    result.subscribe({
      next: () => {},
      complete: onComplete,
    });

    if (mockEventSource.onclose) mockEventSource.onclose();

    expect(onComplete).toHaveBeenCalled();
  });

  it('should abort the EventSource on external stream completion', async () => {
    const fakeReq = new HttpRequest('GET', 'http://example.com/sse');
    const result = service.handle(fakeReq);

    const subscription = result.subscribe();
    subscription.unsubscribe();

    expect(mockEventSource.signal?.aborted).toBeTruthy();
  });
});
