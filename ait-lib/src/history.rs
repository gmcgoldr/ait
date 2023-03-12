use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::convert::TryInto;

use crate::experience::Experience;
use crate::gpt::{GptEmbedding, EMBED_DIMS};
use crate::utils::{new_text_id, TextId};
use base64::{engine::general_purpose, Engine};
use js_sys::{JsString, Uint8Array};
use serde::{Deserialize, Serialize};
use tap::Pipe;
use wasm_bindgen::prelude::*;
use web_sys::window;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("failed to store the history")]
    CantStoreHistory,
    #[error("failed to access the history")]
    CantAccessHistory,
    #[error("failed to build the experience")]
    CantBuildExperience,
    #[error("failed to access the experience")]
    CantAccessExperience,
    #[error("failed to parse the embedding")]
    InvalidEmbedding,
}

impl From<Error> for JsValue {
    fn from(e: Error) -> Self {
        JsValue::from_str(&e.to_string())
    }
}

type Result<T> = core::result::Result<T, Error>;

type GptExperience = Experience<EMBED_DIMS>;

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct History {
    experiences: HashMap<TextId, GptExperience>,
}

impl History {
    fn new() -> History {
        History {
            experiences: HashMap::new(),
        }
    }
}

fn text_id_from_js(text_id_js: &Uint8Array) -> Result<[u8; 32]> {
    let mut text_id = [0u8; 32];
    if text_id_js.length() as usize != text_id.len() {
        Err(Error::CantAccessExperience)?;
    }
    text_id_js.copy_to(&mut text_id);
    Ok(text_id)
}

#[wasm_bindgen]
impl History {
    pub fn store(&self) -> Result<String> {
        let data = rmp_serde::to_vec(self).map_err(|_| Error::CantStoreHistory)?;
        let data = general_purpose::STANDARD_NO_PAD.encode(data);
        window()
            .and_then(|x| x.local_storage().ok())
            .flatten()
            .map(|x| x.set_item("history", &data).ok())
            .flatten()
            .ok_or(Error::CantStoreHistory)?;
        Ok(data)
    }

    pub fn load() -> Result<History> {
        let data = window()
            .and_then(|x| x.local_storage().ok())
            .flatten()
            .and_then(|x| match x.get_item("history") {
                Ok(Some(data)) => Some(data),
                Ok(None) => {
                    let data = History::new().store();
                    data.ok()
                }
                Err(_) => None,
            })
            .ok_or(Error::CantAccessHistory)?;
        let data = general_purpose::STANDARD_NO_PAD
            .decode(data)
            .map_err(|_| Error::CantAccessHistory)?;
        rmp_serde::from_slice(&data).map_err(|_| Error::CantAccessHistory)
    }

    pub async fn add_experience(
        &mut self,
        query: &str,
        response: &str,
        embedding: Uint8Array,
    ) -> Result<()> {
        let embedding =
            GptEmbedding::deserialize(&embedding.to_vec()).map_err(|_| Error::InvalidEmbedding)?;
        let id = new_text_id(&[query, response]);
        if let Entry::Vacant(entry) = self.experiences.entry(id.clone()) {
            entry.insert(Experience::new(
                query.to_string(),
                response.to_string(),
                embedding,
            ));
        }
        Ok(())
    }

    pub fn update_experience(&mut self, id: &Uint8Array, is_positive: bool) -> Result<()> {
        self.experiences
            .get_mut(&text_id_from_js(id)?)
            .ok_or(Error::CantAccessExperience)?
            .pipe(|x| x.increment(is_positive));
        Ok(())
    }

    pub fn related_experiences(&self, embedding: &Uint8Array, num: u32) -> Result<JsString> {
        let embedding =
            GptEmbedding::deserialize(&embedding.to_vec()).map_err(|_| Error::InvalidEmbedding)?;
        let mut scored: Vec<(f32, &GptExperience)> = self
            .experiences
            .values()
            .map(|x| (x.embedding().cosine_distance(&embedding), x))
            .collect();
        scored.sort_by(|a, b| a.0.total_cmp(&b.0));
        let num: usize = num.try_into().map_err(|_| Error::CantAccessExperience)?;
        let related = scored
            .into_iter()
            .take(num)
            .map(|(_, x)| format!("# Query\n\n{}\n\n# Response\n\n{}", x.query(), x.response(),))
            .collect::<Vec<String>>()
            .as_slice()
            .join("\n\n");
        Ok(JsString::from(related))
    }

    pub fn clear(&mut self) {
        self.experiences.clear();
    }
}
