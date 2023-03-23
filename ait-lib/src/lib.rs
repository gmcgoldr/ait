use js_sys::{Array, Uint8Array};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use gpt::{ChatCompletionMessage, ChatCompletionMessageRole};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

mod embedding;
mod experience;
mod gpt;
mod history;
mod history_wasm;
mod utils;

pub use history_wasm::History;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Array contains incorrect values.")]
    ArrayError,
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

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    query: String,
    response: String,
}

#[wasm_bindgen]
pub async fn text_complete(token: &str, prompt: &str) -> Result<String> {
    gpt::text_completion(token, prompt)
        .await
        .map_err(Error::GptError)
}

#[wasm_bindgen]
pub async fn chat_complete(token: &str, messages: Array) -> Result<String> {
    let messages: Vec<Message> = messages
        .iter()
        .map(serde_wasm_bindgen::from_value)
        .map(|x| x.ok())
        .collect::<Option<Vec<Message>>>()
        .ok_or(Error::ArrayError)?;
    let mut chat_messages: Vec<ChatCompletionMessage> = Vec::new();
    for message in messages {
        chat_messages.push(ChatCompletionMessage {
            role: ChatCompletionMessageRole::User,
            content: message.query,
        });
        chat_messages.push(ChatCompletionMessage {
            role: ChatCompletionMessageRole::Assistant,
            content: message.response,
        });
    }
    gpt::chat_completion(token, chat_messages)
        .await
        .map_err(Error::GptError)
}

#[wasm_bindgen]
pub async fn gpt_embed(token: &str, text: &str) -> Result<Uint8Array> {
    gpt::embed(token, text)
        .await
        .map_err(Error::GptError)
        .and_then(|x| x.serialize().map_err(Error::EmbeddingError))
        .map(|x| Uint8Array::from(x.as_slice()))
}
