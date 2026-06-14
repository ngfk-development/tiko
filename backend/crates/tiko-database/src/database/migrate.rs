use crate::database::Database;

pub async fn run(database: &Database) -> Result<(), sqlx::Error> {
    sqlx::migrate!("./migrations").run(&database.pool).await?;
    Ok(())
}
