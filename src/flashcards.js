// Study flashcards for the home page: one card for every type of noun and pronoun the game asks about.
// The front shows the name. The back shows what it means, examples, a sentence, and a tip.
// `skill` matches the `skill` field on the game cards, so the tests can check nothing is missing.

export const FLASHCARDS = [
  // Nouns
  {
    group: 'Nouns', skill: 'common noun',
    definition: 'Names a general person, place, thing, or idea. It is not capitalized unless it starts a sentence.',
    examples: ['city', 'teacher', 'bicycle', 'dog'],
    sentence: 'The dog chased a ball.', focus: 'dog',
    tip: 'Ask: could this be any one of many?',
  },
  {
    group: 'Nouns', skill: 'proper noun',
    definition: 'Names one specific person, place, or thing. It always starts with a capital letter.',
    examples: ['Maria', 'Denver', 'Monday', 'Lake Tahoe'],
    sentence: 'We drove to Chicago last summer.', focus: 'Chicago',
    tip: 'Ask: does it have its own name?',
  },
  {
    group: 'Nouns', skill: 'concrete noun',
    definition: 'Names something you can see, hear, touch, taste, or smell.',
    examples: ['book', 'apple', 'volcano', 'shelf'],
    sentence: 'She placed the book on the shelf.', focus: 'book',
    tip: 'Ask: could I sense it with my five senses?',
  },
  {
    group: 'Nouns', skill: 'abstract noun',
    definition: 'Names an idea, feeling, or quality that you cannot touch.',
    examples: ['courage', 'freedom', 'happiness', 'justice'],
    sentence: 'Her kindness changed everyone in the room.', focus: 'kindness',
    tip: 'Ask: is it an idea or a feeling instead of an object?',
  },
  {
    group: 'Nouns', skill: 'collective noun',
    definition: 'Names a group of people or animals as one unit.',
    examples: ['team', 'class', 'flock', 'jury'],
    sentence: 'The team cheered when the goal went in.', focus: 'team',
    tip: 'Ask: is it one word for a whole group?',
  },
  {
    group: 'Nouns', skill: 'singular noun',
    definition: 'Names just one person, place, thing, or idea.',
    examples: ['cat', 'child', 'mouse', 'box'],
    sentence: 'Her cat slept on the couch.', focus: 'cat',
    tip: 'Count it: is there only one?',
  },
  {
    group: 'Nouns', skill: 'plural noun',
    definition: 'Names more than one. Most add -s or -es, but some change their spelling.',
    examples: ['cats', 'boxes', 'children', 'mice'],
    sentence: 'Several geese crossed the path.', focus: 'geese',
    tip: 'Watch for irregular plurals like mice, geese, and children.',
  },
  {
    group: 'Nouns', skill: 'possessive noun',
    definition: 'Shows that something belongs to someone. It uses an apostrophe.',
    examples: ['dog’s', 'pilot’s', 'students’', 'children’s'],
    sentence: 'The dog’s bowl is empty.', focus: 'dog’s',
    tip: 'One owner: add ’s (dog’s). A plural that ends in s: add only ’ (students’).',
  },

  // Pronouns
  {
    group: 'Pronouns', skill: 'personal pronoun',
    definition: 'Takes the place of a specific person or thing.',
    examples: ['I', 'you', 'she', 'him', 'we', 'they', 'it'],
    sentence: 'Give the report to him before noon.', focus: 'him',
    tip: 'Ask: which person or thing does it stand for?',
  },
  {
    group: 'Pronouns', skill: 'possessive pronoun',
    definition: 'Shows ownership and stands alone in place of a noun.',
    examples: ['mine', 'yours', 'his', 'hers', 'ours', 'theirs'],
    sentence: 'The winning design was hers.', focus: 'hers',
    tip: 'No noun comes after it: “The book is mine.”',
  },
  {
    group: 'Pronouns', skill: 'reflexive pronoun',
    definition: 'Ends in -self or -selves and refers back to the subject. The sentence needs it.',
    examples: ['myself', 'herself', 'ourselves', 'themselves'],
    sentence: 'Lena cut herself on the glass.', focus: 'herself',
    tip: 'Take it out. If the sentence no longer makes sense, it is reflexive.',
  },
  {
    group: 'Pronouns', skill: 'intensive pronoun',
    definition: 'Looks like a reflexive pronoun but only adds emphasis. The sentence works without it.',
    examples: ['myself', 'himself', 'herself', 'themselves'],
    sentence: 'The engineer herself solved the problem.', focus: 'herself',
    tip: 'Take it out. If the sentence still works, it is intensive.',
  },
  {
    group: 'Pronouns', skill: 'demonstrative pronoun',
    definition: 'Points to a specific thing and stands in for it.',
    examples: ['this', 'that', 'these', 'those'],
    sentence: 'Those are the best.', focus: 'Those',
    tip: 'Near: this and these. Far: that and those.',
  },
  {
    group: 'Pronouns', skill: 'indefinite pronoun',
    definition: 'Refers to people or things without naming them.',
    examples: ['someone', 'everyone', 'nobody', 'anything'],
    sentence: 'Someone left the door open again.', focus: 'Someone',
    tip: 'Ask: is the person or thing left unnamed?',
  },
  {
    group: 'Pronouns', skill: 'relative pronoun',
    definition: 'Begins a clause that gives more information about a noun.',
    examples: ['who', 'whom', 'whose', 'which', 'that'],
    sentence: 'The boy who lives next door plays the piano.', focus: 'who',
    tip: 'It links extra information to the noun right before it.',
  },
  {
    group: 'Pronouns', skill: 'interrogative pronoun',
    definition: 'Asks a question.',
    examples: ['who', 'whom', 'whose', 'what', 'which'],
    sentence: 'What did you find in the attic?', focus: 'What',
    tip: 'If the sentence is a question, check the word that starts it.',
  },
];
