# Ait

Ait is an LLM application which uses a dynamic memory to build prompts.

## Learning outside the model weights

In machine learning, inference can be described by the function `f(x, w) -> y`.
Given an input `x` and weights `w`, this function outputs `y`.
And training can be described by the function `g(X) -> w`.
It takes a set of examples `X` and _learns_ weights `w` which make `f` output the desired `y`'s.
There are many details hidden in `g` (e.g. the objective function which describes what are the desired `y`'s),
but these are not important for this conversation.

In practice `g(X)` is computationally expensive,
so the intermediate result `w` is first computed at train time,
and then used at inference time by `f`.

In the case of LLMs,
`f` is typically a transformer-based neural network (e.g. a GPT model),
`w` is the model parameters (e.g. the LLaMA 7B parameters),
and `g` is a training loop whose objective is to predict the next token in a sequence from a large corpus of texts `X`.

The resulting model `f` has been observed to have an interesting property:
it is a few-shot learner.
Consider a query `q` and desired response `r`.
Whereas `f(q, w)` might give an incorrect answer `r'`,
some prompt `p = s + q` can often be found such that `f(p, w) = r`.
Here `s + q` is a few examples of query-response pairs pre-pended to the query string.

It might be possible then to learn some function `h(q) -> s` whose output is the examples needed for `f(p, w)` to output the desired response `r`.
