use crate::embedding::Embedding;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Experience<const N: usize> {
    embedding: Embedding<N>,
    query: String,
    response: String,
    num_positive: u64,
    num_total: u64,
}

impl<const N: usize> Experience<N> {
    pub fn new(query: String, response: String, embedding: Embedding<N>) -> Self {
        Experience {
            embedding,
            query,
            response,
            num_positive: 0,
            num_total: 0,
        }
    }

    pub fn increment(&mut self, is_positive: bool) {
        self.num_total += 1;
        if is_positive {
            self.num_positive += 1;
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
