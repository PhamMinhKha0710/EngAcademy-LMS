# Real-time Notification – WebSocket và STOMP

## Mô tả vấn đề

Hệ thống cần thông báo real-time (notification) khi có sự kiện mới (vd: có bài thi mới, có thông báo từ admin). Dùng WebSocket với protocol STOMP.

## Nguyên nhân

- UX: user không cần refresh để thấy thông báo mới.
- Yêu cầu: push notification từ server xuống client.

## Cách debug

1. Kiểm tra WebSocket connection: browser DevTools → Network → WS.
2. Subscribe topic: client có subscribe đúng topic không.
3. Backend: config `/ws`, STOMP endpoint, message broker.

## Giải pháp

1. **Backend**: Spring WebSocket, STOMP, message broker. Endpoint `/ws`.
2. **Security**: WebSocket handshake cần JWT hoặc token.
3. **Topics**: Ví dụ `/topic/notifications/{userId}`.
4. **Frontend**: sockjs-client, @stomp/stompjs để connect và subscribe.
5. **Notification flow**: Admin gửi → Backend publish → Client nhận → hiển thị toast/alert.

Commit: 51d8f99. Vị trí: `BackEnd/.../WebSocketConfig`, `NotificationController`; `FrontEnd` sockjs, stomp.

## Code mẫu (nếu có)

```ts
// Frontend - stomp
const client = new Client({
  webSocketFactory: () => new SockJS(`${API_URL}/ws`),
  onConnect: () => {
    client.subscribe('/topic/notifications/' + userId, (message) => {
      const data = JSON.parse(message.body)
      showNotification(data)
    })
  }
})
```

## Bài học rút ra

- WebSocket cần handle reconnect, connection lost.
- JWT trong WebSocket: gửi qua query param hoặc header khi connect.

## Cách phòng tránh sau này

1. Document: danh sách topic và format message.
2. Test: gửi message từ backend, verify client nhận.
