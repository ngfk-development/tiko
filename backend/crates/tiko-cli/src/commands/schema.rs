use std::error::Error;

use crate::cli::SchemaArgs;

pub async fn schema(args: SchemaArgs) -> Result<(), Box<dyn Error>> {
    let sdl = tiko_api::sdl();

    match args.out {
        Some(path) => std::fs::write(&path, sdl)?,
        None => println!("{sdl}"),
    }

    Ok(())
}
