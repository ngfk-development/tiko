use fake::Fake;
use fake::faker::name::en::{FirstName, LastName};

use crate::{
    database::{Database, hash_password},
    models::User,
};

const FAKE_USER_COUNT: usize = 500;
const FAKE_USER_PASSWORD: &str = "password123";

pub struct SeedOptions {
    pub user: SeedUserOptions,
}

pub struct SeedUserOptions {
    pub email: String,
    pub password: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
}

pub async fn run(database: &Database, options: SeedOptions) -> Result<(), sqlx::Error> {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&database.pool)
        .await?;

    if count > 0 {
        return Ok(());
    }

    let fake_password_hash = hash_password(FAKE_USER_PASSWORD);
    for index in 0..FAKE_USER_COUNT {
        let first_name: String = FirstName().fake();
        let last_name: String = LastName().fake();
        let email = format!(
            "{}.{}-{index}@example.com",
            first_name.to_lowercase(),
            last_name.to_lowercase()
        );

        sqlx::query(
            "INSERT INTO users (email, first_name, last_name, password_hash, admin)
             VALUES ($1, $2, $3, $4, false)",
        )
        .bind(email)
        .bind(first_name)
        .bind(last_name)
        .bind(&fake_password_hash)
        .execute(&database.pool)
        .await?;
    }

    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (email, first_name, last_name, password_hash, admin)
         VALUES ($1, $2, $3, $4, true)
         RETURNING *",
    )
    .bind(options.user.email)
    .bind(options.user.first_name.unwrap_or("".to_string()))
    .bind(options.user.last_name.unwrap_or("".to_string()))
    .bind(hash_password(&options.user.password))
    .fetch_one(&database.pool)
    .await?;

    sqlx::query(
        "INSERT INTO custom_fields (user_id, position, name, description, icon)
         VALUES ($1, 0, 'Customers', 'The client or company you''re billing time to.', 'building-2'),
                ($1, 1, 'Projects', 'The project or engagement the time entry belongs to.', 'folder-kanban'),
                ($1, 2, 'Tasks', 'The specific task or activity performed.', 'list-todo')
         ON CONFLICT (user_id, name) DO NOTHING",
    )
    .bind(user.id)
    .execute(&database.pool)
    .await?;

    Ok(())
}
