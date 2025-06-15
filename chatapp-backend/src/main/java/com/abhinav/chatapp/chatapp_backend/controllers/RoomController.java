package com.abhinav.chatapp.chatapp_backend.controllers;

import com.abhinav.chatapp.chatapp_backend.entities.Message;
import com.abhinav.chatapp.chatapp_backend.entities.Room;
import com.abhinav.chatapp.chatapp_backend.playload.RoomUserRequest;
import com.abhinav.chatapp.chatapp_backend.services.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody RoomUserRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request.getRoomId(), request.getUserId()));
    }

    @GetMapping
    public ResponseEntity<?> getAllRooms() {
        return ResponseEntity.ok(roomService.getRooms());
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody RoomUserRequest request) {
        return ResponseEntity.ok(roomService.addUserToRoom(request.getRoomId(), request.getUserId()));
    }

    @PostMapping("/leave")
    public ResponseEntity<Room> leaveRoom(@RequestBody RoomUserRequest request) {
        return ResponseEntity.ok(roomService.removeUserFromRoom(request.getRoomId(), request.getUserId()));
    }

    @PostMapping("/promote")
    public ResponseEntity<Room> promote(@RequestBody RoomUserRequest request) {
        return ResponseEntity.ok(roomService.promoteUser(request.getRoomId(), request.getUserId()));
    }

    @PostMapping("/demote")
    public ResponseEntity<Room> demote(@RequestBody RoomUserRequest request) {
        return ResponseEntity.ok(roomService.demoteUser(request.getRoomId(), request.getUserId()));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
    ) {
        return roomService.getPaginatedMessages(roomId, page, size);
    }
}
