# Ait

Ait is an LLM application which uses a dynamic memory to build prompts.

Ait is a technical exploration of ideas relating to LLM memory.
This exploration is not scientific.
This code base is experimental and may not be reliable.

## Few shot prompting 

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

Ait explores the construction of a function `h(q, E) -> p`.
This is a function which takes as input a query `q`,
a set of prior exchanges `E`,
and outputs a prompt `p` such such that `f(p, w) = r`.
