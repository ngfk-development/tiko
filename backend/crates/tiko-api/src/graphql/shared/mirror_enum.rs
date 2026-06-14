/// Generates a GraphQL-facing mirror of a foreign C-like enum: the
/// `#[derive(Enum)]` type itself (variant names auto-converted to
/// `snake_case` for the wire) plus bidirectional `From` conversions. Still a
/// real exhaustive `match` under the hood, so adding a variant to the foreign
/// enum without listing it here fails to compile.
///
/// A variant can optionally override its auto-converted name with
/// `Variant = "literal"` — needed e.g. for `Oauth2`, where snake_case
/// conversion produces `oauth_2` (digit gets its own underscore), not the
/// desired `oauth2`.
macro_rules! mirror_enum {
    ($vis:vis enum $name:ident mirrors $foreign:ty {
        $($variant:ident $(= $gql_name:literal)?),+ $(,)?
    }) => {
        #[derive(::async_graphql::Enum, Copy, Clone, Eq, PartialEq, Hash)]
        #[graphql(rename_items = "snake_case")]
        $vis enum $name {
            $(
                $(#[graphql(name = $gql_name)])?
                $variant,
            )+
        }

        impl From<$foreign> for $name {
            fn from(value: $foreign) -> Self {
                match value {
                    $(<$foreign>::$variant => $name::$variant,)+
                }
            }
        }

        impl From<$name> for $foreign {
            fn from(value: $name) -> Self {
                match value {
                    $($name::$variant => <$foreign>::$variant,)+
                }
            }
        }
    };
}

pub(crate) use mirror_enum;
