//! Interact with OpenAI's GPT models.

use serde::{Deserialize, Serialize};
use serde_with::{serde_as, skip_serializing_none};
use tap::Pipe;
use thiserror;

use crate::embedding::Embedding;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("failed to request text completion")]
    InvalidTextCompletion,
    #[error("failed to request chat completion")]
    InvalidChatCompletion,
    #[error("failed to request embedding")]
    InvalidEmbedding,
    #[error("failed to serailize embedding")]
    CantSerialize,
    #[error("failed to de-serailize embedding")]
    CantDeserialize,
}

type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum FinishReason {
    Stop,
    Length,
}

#[derive(Debug, Serialize, Deserialize)]
enum ListObjectValue {
    #[serde(rename = "list")]
    List,
}

#[derive(Debug, Serialize, Deserialize)]
enum TextCompletionObjectValue {
    #[serde(rename = "text_completion")]
    TextCompletion,
}

#[derive(Debug, Serialize, Deserialize)]
struct TextCompletionChoice {
    text: String,
    finish_reason: FinishReason,
}

#[derive(Debug, Serialize, Deserialize)]
struct TextCompletionResponse {
    object: TextCompletionObjectValue,
    choices: Vec<TextCompletionChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
enum TextCompletionModel {
    #[serde(rename = "text-davinci-003")]
    GptDavinci003,
}

#[derive(Debug, Serialize)]
#[skip_serializing_none]
struct TextCompletionRequest<'a> {
    model: TextCompletionModel,
    prompt: &'a str,
    max_tokens: Option<u16>,
    temperature: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
enum ChatCompletionObjectValue {
    #[serde(rename = "chat.completion")]
    ChatCompletion,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ChatCompletionMessageRole {
    #[serde(rename = "system")]
    System,
    #[serde(rename = "assistant")]
    Assistant,
    #[serde(rename = "user")]
    User,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatCompletionMessage {
    pub role: ChatCompletionMessageRole,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatCompletionChoice {
    message: ChatCompletionMessage,
    finish_reason: FinishReason,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChatCompletionResponse {
    object: ChatCompletionObjectValue,
    choices: Vec<ChatCompletionChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
enum ChatCompletionModel {
    #[serde(rename = "gpt-3.5-turbo")]
    Gpt35Turbot,
    #[serde(rename = "gpt-3.5-turbo")]
    Gpt35Turbot0301,
}

#[derive(Debug, Serialize)]
#[skip_serializing_none]
struct ChatCompletionRequest {
    model: ChatCompletionModel,
    messages: Vec<ChatCompletionMessage>,
    max_tokens: Option<u16>,
    temperature: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
enum EmbeddingObjectValue {
    #[serde(rename = "embedding")]
    Embedding,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum EmbeddingModel {
    #[serde(rename = "text-embedding-ada-002")]
    TextEmbeddingAda002,
}

#[serde_as]
#[derive(Debug, Serialize, Deserialize)]
struct EmbeddingData {
    #[serde_as(as = "[_; 1536]")]
    embedding: [f32; 1536],
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbeddingResponse {
    object: ListObjectValue,
    data: Vec<EmbeddingData>,
}

#[derive(Debug, Serialize, Deserialize)]
struct EmbeddingRequest<'a> {
    model: EmbeddingModel,
    input: &'a str,
}

/// Generate a continuation for the given `prompt`.
pub async fn text_completion(token: &str, prompt: &str) -> Result<String> {
    reqwest::Client::new()
        .post("https://api.openai.com/v1/completions")
        .bearer_auth(token)
        .json(&TextCompletionRequest {
            model: TextCompletionModel::GptDavinci003,
            prompt,
            max_tokens: Some(2048),
            temperature: Some(0.0),
        })
        .send()
        .await
        .map_err(|_| Error::InvalidTextCompletion)?
        .json::<TextCompletionResponse>()
        .await
        .ok()
        .and_then(|x| x.choices.into_iter().next().map(|x| x.text))
        .ok_or(Error::InvalidTextCompletion)?
        .pipe(Ok)
}

const SYSTEM_MESSAGE: &'static str = "\
You are Ait, a helpful AI assistant. \
You have extensive knowledge of many facts documented on the world wide web. \
However, you are not able to perfectly recall those facts. \
When you are unsure about a detail, do not attempt to provide an answer. \
You instead state that you do not know the answer.\
";

/// Generate a response for the chat history given by `messages`.
pub async fn chat_completion(token: &str, messages: Vec<ChatCompletionMessage>) -> Result<String> {
    let messages = {
        let mut messages = messages;
        messages.insert(
            0,
            ChatCompletionMessage {
                role: ChatCompletionMessageRole::System,
                content: SYSTEM_MESSAGE.to_string(),
            },
        );
        messages
    };
    reqwest::Client::new()
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(token)
        .json(&ChatCompletionRequest {
            model: ChatCompletionModel::Gpt35Turbot0301,
            messages,
            max_tokens: Some(2048),
            temperature: Some(0.0),
        })
        .send()
        .await
        .map_err(|_| Error::InvalidChatCompletion)?
        .json::<ChatCompletionResponse>()
        .await
        .ok()
        .and_then(|x| x.choices.into_iter().next().map(|x| x.message.content))
        .ok_or(Error::InvalidChatCompletion)?
        .pipe(Ok)
}

pub const fn embedding_model_size(model: EmbeddingModel) -> usize {
    match model {
        EmbeddingModel::TextEmbeddingAda002 => 1536,
    }
}

pub const EMBED_DIMS: usize = embedding_model_size(EmbeddingModel::TextEmbeddingAda002);
pub type GptEmbedding = Embedding<EMBED_DIMS>;

/// Generate an embedding for the given `text`.
pub async fn embed(token: &str, text: &str) -> Result<GptEmbedding> {
    reqwest::Client::new()
        .post("https://api.openai.com/v1/embeddings")
        .bearer_auth(token)
        .json(&EmbeddingRequest {
            model: EmbeddingModel::TextEmbeddingAda002,
            input: text,
        })
        .send()
        .await
        .map_err(|_| Error::InvalidEmbedding)?
        .json::<EmbeddingResponse>()
        .await
        .ok()
        .and_then(|x| x.data.into_iter().next())
        .map(|x| GptEmbedding::new(text, x.embedding))
        .ok_or(Error::InvalidEmbedding)?
        .pipe(Ok)
}
