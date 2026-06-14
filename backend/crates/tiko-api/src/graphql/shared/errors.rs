use async_graphql::{Error as GqlError, ErrorExtensions};

pub struct ValidationError {
    message: String,
    field: Option<String>,
}

impl ValidationError {
    pub fn new(message: impl Into<String>) -> Self {
        ValidationError {
            message: message.into(),
            field: None,
        }
    }

    pub fn field(mut self, field: impl Into<String>) -> Self {
        self.field = Some(field.into());
        self
    }
}

impl From<ValidationError> for GqlError {
    fn from(err: ValidationError) -> Self {
        GqlError::new(err.message).extend_with(|_, e| {
            e.set("code", "BAD_USER_INPUT");
            if let Some(field) = &err.field {
                e.set("field", field.clone());
            }
        })
    }
}
