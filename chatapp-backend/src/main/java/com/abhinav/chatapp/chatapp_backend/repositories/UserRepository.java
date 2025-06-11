package com.abhinav.chatapp.chatapp_backend.repositories;

import com.abhinav.chatapp.chatapp_backend.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String>  {
    Optional<User> findByEmail(String email);
}
