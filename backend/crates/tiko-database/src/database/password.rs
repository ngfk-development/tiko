use argon2::password_hash::{PasswordHash, SaltString, rand_core::OsRng};
use argon2::{Argon2, PasswordHasher, PasswordVerifier};

pub fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);

    return Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .unwrap()
        .to_string();
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    let Ok(parsed_hash) = PasswordHash::new(hash) else {
        return false;
    };

    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok()
}
