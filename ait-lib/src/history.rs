use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::collections::hash_map::{Entry, HashMap};
use std::collections::HashSet;
use wasm_bindgen::prelude::*;

use crate::embedding::Embedding;
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
    #[error("failed to parse the text ID")]
    InvalidTextId,
    #[error("failed to build messages")]
    CantBuildMessages,
}

impl From<Error> for JsValue {
    fn from(e: Error) -> Self {
        JsValue::from_str(&e.to_string())
    }
}

type Result<T> = core::result::Result<T, Error>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Experience<const N: usize> {
    pub id: TextId,
    pub embedding: Embedding<N>,
    pub query: String,
    pub response: String,
    pub rank: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LinkedExperience<const N: usize> {
    pub experience: Experience<N>,
    pub links: Vec<TextId>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct History<const N: usize> {
    experiences: HashMap<TextId, LinkedExperience<N>>,
    last_id: Option<TextId>,
    next_rank: u32,
}

fn insert_sorted_by<T, F>(vec: &mut Vec<T>, item: T, f: F)
where
    F: FnMut(&T) -> Ordering,
{
    let idx = vec.binary_search_by(f).unwrap_or_else(|x| x);
    vec.insert(idx, item);
}

impl<const N: usize> History<N> {
    pub fn new() -> History<N> {
        History {
            experiences: HashMap::new(),
            last_id: None,
            next_rank: 0,
        }
    }

    pub fn len(&self) -> usize {
        self.experiences.len()
    }

    pub fn push(
        &mut self,
        query: &str,
        response: &str,
        embedding: Embedding<N>,
        links: Vec<TextId>,
    ) -> Result<TextId> {
        let id = new_text_id(&[query, response]);
        if let Entry::Vacant(entry) = self.experiences.entry(id.clone()) {
            entry.insert(LinkedExperience::<N> {
                experience: Experience::<N> {
                    id,
                    query: query.to_string(),
                    response: response.to_string(),
                    embedding,
                    rank: self.next_rank,
                },
                links,
            });
        };
        self.last_id = Some(id.clone());
        self.next_rank += 1;
        Ok(id.clone())
    }

    pub fn get(&self, text_id: &TextId) -> Option<&Experience<N>> {
        self.experiences.get(text_id).map(|x| &x.experience)
    }

    pub fn related(&self, embedding: &Embedding<N>, num: usize) -> Result<Vec<TextId>> {
        let mut related: Vec<(f32, TextId)> = Vec::new();
        let mut added: HashSet<&TextId> = HashSet::new();
        let mut queue: Vec<(f32, TextId)> = self
            .last_id
            .as_ref()
            .and_then(|x| self.experiences.get(x))
            .map(|x| {
                vec![(
                    x.experience.embedding.cosine_distance(&embedding),
                    x.experience.id,
                )]
            })
            .unwrap_or_else(|| Vec::new());
        loop {
            if related.len() >= num {
                break;
            }
            if let Some((distance, next_id)) = queue.pop() {
                let experience = self.experiences.get(&next_id);
                let LinkedExperience { links, .. } = match experience {
                    Some(experience) => experience,
                    None => continue,
                };
                // push most related to front of results
                insert_sorted_by(&mut related, (distance, next_id.clone()), |(x, _)| {
                    x.total_cmp(&distance)
                });
                for link_id in links {
                    if added.contains(link_id) {
                        continue;
                    }
                    let experience = self.experiences.get(link_id);
                    let LinkedExperience { experience, .. } = match experience {
                        Some(experience) => experience,
                        None => continue,
                    };
                    let distance = experience.embedding.cosine_distance(&embedding);
                    added.insert(link_id);
                    // push most related to back so they are prioritized
                    insert_sorted_by(&mut queue, (distance, link_id.clone()), |(x, _)| {
                        x.total_cmp(&distance).reverse()
                    });
                }
            } else {
                break;
            }
        }
        let related: Vec<TextId> = related.into_iter().map(|(_, x)| x).collect();
        Ok(related)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn history_pushes_and_gets() {
        let mut history = History::<2>::new();
        let e1 = Embedding::new("", [0.0, 1.0]);
        let e2 = Embedding::new("", [1.0, 0.0]);
        let id1 = history.push("q1", "r1", e1, vec![]).unwrap();
        let id2 = history.push("q2", "r2", e2, vec![]).unwrap();
        assert_eq!(history.get(&id1).unwrap().query, "q1");
        assert_eq!(history.get(&id2).unwrap().query, "q2");
    }

    #[test]
    fn history_pushes_and_gets_related() {
        let mut history = History::<2>::new();
        let e1 = Embedding::new("", [0.0, 1.0]);
        let e2 = Embedding::new("", [1.0, 0.0]);
        let e3 = Embedding::new("", [1.0, 1.0]);
        let e4 = Embedding::new("", [1.0, 2.0]);
        let id1 = history.push("q1", "r1", e1, vec![]).unwrap();
        let id2 = history.push("q2", "r2", e2, vec![]).unwrap();
        let id3 = history.push("q3", "r3", e3, vec![id2.clone()]).unwrap();
        let id4 = history
            .push("q4", "r4", e4, vec![id3.clone(), id1.clone()])
            .unwrap();
        // gets id4, (id3, id1), stops at id3, ranks 3 over 4
        let ids = history.related(&Embedding::new("", [1.0, 0.0]), 2).unwrap();
        assert_eq!(ids, vec![id3.clone(), id4.clone()]);
        // gets id4, (id1, id3), stops at id1, ranks 1 over 4
        let ids = history.related(&Embedding::new("", [0.0, 1.0]), 2).unwrap();
        assert_eq!(ids, vec![id1.clone(), id4.clone()]);
    }
}
