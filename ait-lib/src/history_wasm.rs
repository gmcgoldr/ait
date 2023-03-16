use base64::{engine::general_purpose, Engine};
use js_sys::{Array, JsString, Uint8Array};
use std::iter::FromIterator;
use tap::Pipe;
use wasm_bindgen::prelude::*;
use web_sys::window;

use crate::gpt::GptEmbedding;
use crate::history::{Error, History as HistoryRs};

type Result<T> = core::result::Result<T, Error>;

fn text_id_from_js(text_id_js: &Uint8Array) -> Result<[u8; 32]> {
    let mut text_id = [0u8; 32];
    if text_id_js.length() as usize != text_id.len() {
        Err(Error::CantAccessExperience)?;
    }
    text_id_js.copy_to(&mut text_id);
    Ok(text_id)
}

#[wasm_bindgen]
pub struct History(HistoryRs);

#[wasm_bindgen]
impl History {
    pub fn store(&self) -> Result<String> {
        let data = rmp_serde::to_vec(&self.0).map_err(|_| Error::CantStoreHistory)?;
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
                    let data = History(HistoryRs::new()).store();
                    data.ok()
                }
                Err(_) => None,
            })
            .ok_or(Error::CantAccessHistory)?;
        let data = general_purpose::STANDARD_NO_PAD
            .decode(data)
            .map_err(|_| Error::CantAccessHistory)?;
        rmp_serde::from_slice(&data)
            .map(History)
            .map_err(|_| Error::CantAccessHistory)
    }

    pub async fn push(&mut self, query: &str, response: &str, embedding: Uint8Array) -> Result<()> {
        let embedding =
            GptEmbedding::deserialize(&embedding.to_vec()).map_err(|_| Error::InvalidEmbedding)?;
        self.0.push(query, response, embedding).await
    }

    pub fn remove(&mut self, text_id: &Uint8Array) -> Result<()> {
        let text_id = text_id_from_js(text_id)?;
        self.0.remove(&text_id);
        Ok(())
    }

    pub fn related_ids(&self, embedding: &Uint8Array, num: u32) -> Result<Array> {
        let embedding =
            GptEmbedding::deserialize(&embedding.to_vec()).map_err(|_| Error::InvalidEmbedding)?;
        self.0
            .related(&embedding, num)?
            .into_iter()
            .map(|x| Uint8Array::from(x.text_id.as_slice()))
            .pipe(Array::from_iter)
            .pipe(Ok)
    }

    pub fn get_last_ids(&self, num: usize) -> Array {
        self.0
            .get_last(num)
            .into_iter()
            .map(|x| Uint8Array::from(x.text_id.as_slice()))
            .rev()
            .pipe(Array::from_iter)
    }

    pub fn get_query(&self, text_id: &Uint8Array) -> Result<JsString> {
        let text_id = text_id_from_js(text_id)?;
        self.0
            .get(&text_id)
            .ok_or(Error::CantAccessExperience)?
            .experience
            .query()
            .pipe(JsString::from)
            .pipe(Ok)
    }

    pub fn get_response(&self, text_id: &Uint8Array) -> Result<JsString> {
        let text_id = text_id_from_js(text_id)?;
        self.0
            .get(&text_id)
            .ok_or(Error::CantAccessExperience)?
            .experience
            .response()
            .pipe(JsString::from)
            .pipe(Ok)
    }
}
