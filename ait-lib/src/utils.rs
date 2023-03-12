use sha2::{Digest, Sha256};
use web_sys::console;

pub type TextId = [u8; 32];

pub fn new_text_id<TList: AsRef<[TStr]>, TStr: AsRef<str>>(texts: &TList) -> TextId {
    let mut hash = Sha256::new();
    for text in texts.as_ref() {
        hash.update(text.as_ref());
    }
    hash.finalize().into()
}

#[allow(dead_code)]
pub fn console_log(text: &str) {
    console::log_1(&text.into());
}
