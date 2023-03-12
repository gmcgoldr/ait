use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod embedding;
mod experience;
mod gpt;
mod history;
mod utils;

pub use history::History;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    GptError(#[from] gpt::Error),
    #[error(transparent)]
    EmbeddingError(#[from] embedding::Error),
}

impl From<Error> for JsValue {
    fn from(e: Error) -> Self {
        JsValue::from_str(&e.to_string())
    }
}

type Result<T> = core::result::Result<T, Error>;

#[wasm_bindgen]
pub fn build_prompt(prompt: &str, context: &str) -> String {
    format!("{}\n\n# Query\n\n{}# Reply\n\n", context, prompt)
}

#[wasm_bindgen]
pub async fn gpt_generate(token: &str, prompt: &str) -> Result<String> {
    gpt::generate(token, prompt).await.map_err(Error::GptError)
}

#[wasm_bindgen]
pub async fn gpt_embed(token: &str, text: &str) -> Result<Uint8Array> {
    gpt::embed(token, text)
        .await
        .map_err(Error::GptError)
        .and_then(|x| x.serialize().map_err(Error::EmbeddingError))
        .map(|x| Uint8Array::from(x.as_slice()))
}
