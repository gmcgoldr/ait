use crate::embedding::Embedding;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Experience<const N: usize> {
    embedding: Embedding<N>,
    query: String,
    response: String,
    rank: u64,
}

impl<const N: usize> Experience<N> {
    pub fn new(query: String, response: String, embedding: Embedding<N>, rank: u64) -> Self {
        Experience {
            embedding,
            query,
            response,
            rank,
        }
    }

    pub fn embedding(&self) -> &Embedding<N> {
        &self.embedding
    }

    pub fn query(&self) -> &str {
        &self.query
    }

    pub fn response(&self) -> &str {
        &self.response
    }
}
