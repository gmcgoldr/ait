use crate::utils::{new_text_id, TextId};
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use thiserror;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("failed to serailize embedding")]
    CantSerialize,
    #[error("failed to de-serailize embedding")]
    CantDeserialize,
}

type Result<T> = core::result::Result<T, Error>;

pub type Vector<const N: usize> = [f32; N];

#[serde_as]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Embedding<const N: usize> {
    id: TextId,
    #[serde_as(as = "[_; N]")]
    vector: Vector<N>,
}

impl<const N: usize> Embedding<N> {
    pub fn new(text: &str, vector: [f32; N]) -> Self {
        let id = new_text_id(&[text]);
        Self { id, vector }
    }

    fn norm(&self) -> f32 {
        self.vector.iter().map(|x| x * x).sum::<f32>().sqrt()
    }

    fn dot(&self, other: &Embedding<N>) -> f32 {
        self.vector
            .iter()
            .zip(other.vector.iter())
            .map(|(a, b)| a * b)
            .sum::<f32>()
    }

    pub fn cosine_distance(&self, other: &Embedding<N>) -> f32 {
        1.0 - self.dot(other) / (self.norm() * other.norm())
    }

    pub fn serialize(&self) -> Result<Vec<u8>> {
        rmp_serde::to_vec(self).map_err(|_| Error::CantSerialize)
    }

    pub fn deserialize(data: &impl AsRef<[u8]>) -> Result<Self> {
        rmp_serde::from_slice(data.as_ref()).map_err(|_| Error::CantDeserialize)
    }
}
