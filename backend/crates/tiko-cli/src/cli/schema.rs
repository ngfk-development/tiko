use clap::Parser;

#[derive(Parser)]
pub struct SchemaArgs {
    #[arg(long, help = "Path to write the SDL to (prints to stdout if omitted)")]
    pub out: Option<String>,
}
