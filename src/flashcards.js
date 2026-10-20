// Study flashcards for the home page: one card for every type of noun and pronoun the game asks about. The front shows the name. The back shows what it means,
// examples, a sentence (mostly famous lines), and a tip.
// `skill` matches the `skill` field on the game cards, so the tests can check nothing is missing.

export const FLASHCARDS = [
  // Nouns
  {
    group: 'Nouns', skill: 'common noun',
    definition: 'Names a general person, place, thing, or idea rather than a particular one.',
    examples: ['novel', 'poet', 'harbor', 'idea'],
    sentence: 'The poet revised the final stanza.', focus: 'poet',
    tip: 'Capitalize it only at the start of a sentence.',
  },
  {
    group: 'Nouns', skill: 'proper noun',
    definition: 'Names one particular person, place, work, or event, and is capitalized.',
    examples: ['Hamlet', 'Denmark', 'Gatsby', 'the Renaissance'],
    sentence: 'Call me Ishmael.', focus: 'Ishmael',
    tip: 'Titles and the names of movements count too: Moby-Dick, the Renaissance.',
  },
  {
    group: 'Nouns', skill: 'concrete noun',
    definition: 'Names something you can perceive with your five senses.',
    examples: ['dagger', 'letter', 'conch', 'light'],
    sentence: 'So we beat on, boats against the current, borne back ceaselessly into the past.', focus: 'boats',
    tip: 'Writers often use a concrete noun as a symbol for an abstract idea, like Gatsby’s green light.',
  },
  {
    group: 'Nouns', skill: 'abstract noun',
    definition: 'Names an idea, quality, feeling, or state that you cannot perceive with your senses.',
    examples: ['brevity', 'ambition', 'shame', 'justice'],
    sentence: 'Brevity is the soul of wit.', focus: 'Brevity',
    tip: 'Many abstract nouns end in -ness, -ity, -tion, or -dom.',
  },
  {
    group: 'Nouns', skill: 'collective noun',
    definition: 'Names a group as a single unit.',
    examples: ['chorus', 'jury', 'crowd', 'family'],
    sentence: 'The chorus comments on the action between the scenes.', focus: 'chorus',
    tip: 'In American English it usually takes a singular verb: “The jury is out.”',
  },
  {
    group: 'Nouns', skill: 'possessive noun',
    definition: 'Shows ownership, usually with an apostrophe and s.',
    examples: ['summer’s', 'narrator’s', 'Dickens’s', 'sisters’'],
    sentence: 'Shall I compare thee to a summer’s day?', focus: 'summer’s',
    tip: 'For a plural that ends in s, add only an apostrophe: the sisters’ hopes.',
  },

  // Pronouns
  {
    group: 'Pronouns', skill: 'personal pronoun',
    definition: 'Stands for a specific person or thing, in subject form (I, he, they) or object form (me, him, them).',
    examples: ['I', 'me', 'she', 'him', 'thou', 'it'],
    sentence: 'Between you and me, the ending felt rushed.', focus: 'me',
    tip: 'After a preposition, use the object form: “between you and me.”',
  },
  {
    group: 'Pronouns', skill: 'possessive pronoun',
    definition: 'Shows ownership and stands alone in place of a noun.',
    examples: ['mine', 'yours', 'his', 'hers', 'ours', 'theirs'],
    sentence: 'Whatever our souls are made of, his and mine are the same.', focus: 'mine',
    tip: 'Never use an apostrophe: “hers,” “ours,” and “theirs.”',
  },
  {
    group: 'Pronouns', skill: 'reflexive pronoun',
    definition: 'Ends in -self or -selves and refers back to the subject. The sentence needs it.',
    examples: ['myself', 'himself', 'ourselves', 'themselves'],
    sentence: 'I celebrate myself, and sing myself,', focus: 'myself',
    tip: 'Take it out. If the sentence no longer makes sense, it is reflexive.',
  },
  {
    group: 'Pronouns', skill: 'intensive pronoun',
    definition: 'Looks like a reflexive pronoun but only adds emphasis. The sentence works without it.',
    examples: ['myself', 'himself', 'herself', 'themselves'],
    sentence: 'Mrs. Dalloway said she would buy the flowers herself.', focus: 'herself',
    tip: 'Take it out. If the sentence still works, it is intensive.',
  },
  {
    group: 'Pronouns', skill: 'demonstrative pronoun',
    definition: 'Points to a specific thing or idea and stands in for it.',
    examples: ['this', 'that', 'these', 'those'],
    sentence: 'To be, or not to be, that is the question:', focus: 'that',
    tip: 'If a noun comes right after it (this dagger), it describes the noun instead of standing alone.',
  },
  {
    group: 'Pronouns', skill: 'indefinite pronoun',
    definition: 'Refers to people or things without naming them.',
    examples: ['something', 'nothing', 'none', 'each', 'some'],
    sentence: 'Nothing will come of nothing: speak again.', focus: 'Nothing',
    tip: 'Each, everyone, and nobody are singular: “Each of the pilgrims agrees.”',
  },
  {
    group: 'Pronouns', skill: 'relative pronoun',
    definition: 'Begins a clause that describes a noun.',
    examples: ['who', 'whom', 'whose', 'which', 'that'],
    sentence: 'The conch, which once commanded order, is finally smashed.', focus: 'which',
    tip: 'Use “who” for subjects and “whom” for objects.',
  },
  {
    group: 'Pronouns', skill: 'interrogative pronoun',
    definition: 'Asks a question.',
    examples: ['who', 'whom', 'whose', 'what', 'which'],
    sentence: 'I’m Nobody! Who are you?', focus: 'Who',
    tip: 'Answer the question with “he” or “him.” If “him” fits, the question needs “whom.”',
  },
];
