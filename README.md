# Ait

Ait is a technical exploration of an idea relating to incorporating long-term memory in applications using large language model (LLM).
This code base is experimental and should not be considered to be reliable.
This exploration is not scientific.

You can try the [Ait demo](https://gmcgoldr.github.io/ait) to get a practical experience of the concept.

The concept of adding memory to LLMs is not new.
LangChain's exploration of [LLM memory](https://python.langchain.com/en/latest/modules/memory.html) is a good entry point for discovering ideas relating to this topic.

## How does it work

Ait generates a new _context_ for every user query.
That context is built by finding prior query-response pairs (_experiences_) which are related to the current query.
The experiences are selected by traversing a tree of related experiences to build a set of candidates experiences,
and then keeping those experiences most similar to the current query.
The similarity is based on the distance of the query and the experience embeddings.

The [Ait demo](https://gmcgoldr.github.io/ait/) uses ChatGPT powered by GPT3.5.

This approach to context building leads to some interesting effects:

- Ait is able to draw from a much larger context than a vanilla LLM.
- Each instance of Ait is different:
  the model output is not a function only of its input query,
  but also of its entire history of experiences.
- Each instance of Ait can learn to some extent without the need for back-propagation:
  by correcting or modifying responses,
  future outputs of Ait can be steered towards using specific formulations and facts.

## LLM context

An LLM has a _context_ window in which some input text is passed to the model,
and in which the model writes its output text.
In effect, the LLM attempts to continue whatever text it encounters in its context window.
The context window for a particular LLM architecture has a fixed length,
and can typically contain a few thousand words.

In the case of Chat GPT,
the context contains the prior conversation history.
A chat conversation context might look something like:

```
User: What causes an object to sink or float in water?
Response: An object sinks or floats in water based on its density. If the object is denser than water, it will sink. If it is less dense than water, it will float.

Query: Why does a boat with an aluminum hull float in water?
Response:
```

The context contains the prior query-response pairs (_experiences_).
The context ends with the start of a response,
and the model will attempt to continue its context with a sensible response.

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
