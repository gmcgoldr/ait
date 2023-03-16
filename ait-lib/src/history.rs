use linked_hash_map::{Entry, LinkedHashMap};
use serde::{Deserialize, Serialize};
use std::convert::TryInto;
use tap::Pipe;
use wasm_bindgen::prelude::*;

use crate::experience::Experience;
use crate::gpt::{GptEmbedding, EMBED_DIMS};
use crate::utils::{new_text_id, TextId};

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
    #[error("failed to build messages")]
    CantBuildMessages,
}

impl From<Error> for JsValue {
    fn from(e: Error) -> Self {
        JsValue::from_str(&e.to_string())
    }
}

type Result<T> = core::result::Result<T, Error>;

type GptExperience = Experience<EMBED_DIMS>;

#[derive(Debug, Serialize, Deserialize)]
pub struct IdExperience {
    pub text_id: TextId,
    pub experience: GptExperience,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct History {
    experiences: LinkedHashMap<TextId, IdExperience>,
    next_rank: u64,
}

impl History {
    pub fn new() -> History {
        History {
            experiences: LinkedHashMap::new(),
            next_rank: 0,
        }
    }

    pub async fn push(
        &mut self,
        query: &str,
        response: &str,
        embedding: GptEmbedding,
    ) -> Result<()> {
        let id = new_text_id(&[query, response]);
        if let Entry::Vacant(entry) = self.experiences.entry(id.clone()) {
            entry.insert(IdExperience {
                text_id: id,
                experience: Experience::new(
                    query.to_string(),
                    response.to_string(),
                    embedding,
                    self.next_rank,
                ),
            });
            self.next_rank += 1;
        }
        Ok(())
    }

    pub fn get(&self, text_id: &TextId) -> Option<&IdExperience> {
        self.experiences.get(text_id)
    }

    pub fn remove(&mut self, text_id: &TextId) -> Option<IdExperience> {
        self.experiences.remove(text_id)
    }

    pub fn related(&self, embedding: &GptEmbedding, num: u32) -> Result<Vec<&IdExperience>> {
        let mut scored: Vec<(f32, &IdExperience)> = self
            .experiences
            .iter()
            .map(|(_, x)| (x.experience.embedding().cosine_distance(&embedding), x))
            .collect();
        scored.sort_by(|a, b| a.0.total_cmp(&b.0));
        let num: usize = num.try_into().map_err(|_| Error::CantAccessExperience)?;
        scored
            .into_iter()
            .take(num)
            .map(|(_, x)| x)
            .collect::<Vec<&IdExperience>>()
            .pipe(Ok)
    }

    pub fn get_last(&self, num: usize) -> Vec<&IdExperience> {
        self.experiences
            .iter()
            .map(|(_, x)| x)
            .rev()
            .take(num)
            .rev()
            .collect()
    }
}
