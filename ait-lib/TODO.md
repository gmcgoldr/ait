- experience contains text id
- related experiences returns scores (distance) and text id
- history can retrieve by text id

- dispaly context at top
- when writing a query, give last N
- each experience has a delete button
- each experience has a distance
- each experience has a reward range

- for stack overflow questions
  - pose the question


- distinguish what the model has experience vs. gut reaction
  - when answer uses facts from context, say "I recall"
  - when answer introducdes new facts, say "Off the top of my head"
  - then create a follow up prompt
  - "I need to verify ..."

- critique
  - given a response
  - if not satisfactory
  - write a critique
  - critique indicates next step
    - e.g. read about a topic
  - predict critique for new response
  - continue until no critique is generated


- how do you know this?
