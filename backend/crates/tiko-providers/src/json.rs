use serde::Deserialize;

pub(crate) fn deserialize<T: for<'de> Deserialize<'de>>(
    body: &str,
) -> Result<T, serde_path_to_error::Error<serde_json::Error>> {
    let deserializer = &mut serde_json::Deserializer::from_str(body);
    serde_path_to_error::deserialize(deserializer)
}
