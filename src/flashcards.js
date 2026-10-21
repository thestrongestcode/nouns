// Study flashcards for the home page: one card for every type of noun and pronoun the game asks about.
// The front shows the name. The back shows a definition, the full set of examples, a plain everyday
// sentence, and a tip that tells the type apart from the words it is most often confused with.
// `skill` matches the `skill` field on the game cards, so the tests can check nothing is missing.

export const FLASHCARDS = [
  // Nouns
  {
    group: 'Nouns', skill: 'common noun',
    definition: 'Names a general person, place, thing, or idea, not a specific one.',
    examples: ['teacher', 'city', 'novel', 'river', 'freedom'],
    sentence: 'The teacher handed back our essays.', focus: 'teacher',
    tip: 'Ask: could this word mean any one of many? “city” = common noun. “Madrid” = proper noun. A common noun is lowercase unless it starts a sentence.',
  },
  {
    group: 'Nouns', skill: 'proper noun',
    definition: 'Names a specific person, place, organization, title, or event, and always starts with a capital letter.',
    examples: ['Maya', 'Madrid', 'Hamlet', 'Lake Tahoe', 'the Renaissance'],
    sentence: 'Maya moved to Madrid last summer.', focus: 'Madrid',
    tip: 'It is the name of one particular thing. Watch out: a word capitalized only because it starts a sentence (“Reader, I married him.”) is not automatically a proper noun.',
  },
  {
    group: 'Nouns', skill: 'concrete noun',
    definition: 'Names something you can experience with your five senses: see, hear, touch, taste, or smell.',
    examples: ['book', 'thunder', 'perfume', 'chair', 'apple'],
    sentence: 'The thunder shook the windows.', focus: 'thunder',
    tip: 'Ask: could I see, hear, touch, taste, or smell it? Sounds and smells count. “Thunder” is concrete, but “fear” of thunder is abstract.',
  },
  {
    group: 'Nouns', skill: 'abstract noun',
    definition: 'Names an idea, feeling, quality, or state that you cannot experience with your senses.',
    examples: ['courage', 'freedom', 'love', 'honesty', 'childhood'],
    sentence: 'Her honesty surprised everyone.', focus: 'honesty',
    tip: 'Ask: can I touch it? If not, it is abstract. Many end in -ness, -ity, -tion, -ment, or -hood: kindness, curiosity, education, excitement, childhood.',
  },
  {
    group: 'Nouns', skill: 'collective noun',
    definition: 'Names a group of people, animals, or things as a single unit.',
    examples: ['team', 'class', 'jury', 'family', 'flock', 'audience'],
    sentence: 'The jury reached its decision.', focus: 'jury',
    tip: 'One word, many members. In American English it usually takes a singular verb: “The team is ready,” not “The team are ready.”',
  },
  {
    group: 'Nouns', skill: 'possessive noun',
    definition: 'Shows that something belongs to or is connected to someone or something.',
    examples: ['Maya’s', 'the dog’s', 'the students’', 'the children’s', 'James’s'],
    sentence: 'Maya’s locker is next to mine.', focus: 'Maya’s',
    tip: 'One owner: add ’s (the student’s book). A plural ending in s: add only ’ (the students’ books). A plural not ending in s: add ’s (the children’s books).',
  },

  // Pronouns
  {
    group: 'Pronouns', skill: 'personal pronoun',
    definition: 'Takes the place of a specific person or thing. Its form changes with its job: subject (I, he, she, we, they) or object (me, him, her, us, them).',
    examples: ['I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'us', 'them'],
    sentence: 'Coach Rivera picked us for the team.', focus: 'us',
    tip: 'Use the subject form before the verb and the object form after a verb or preposition. Cover the other person to check: “My friend and I left” (I left), “between you and me” (for me).',
  },
  {
    group: 'Pronouns', skill: 'possessive pronoun',
    definition: 'Shows ownership and replaces the noun completely, so it stands alone.',
    examples: ['mine', 'yours', 'his', 'hers', 'ours', 'theirs'],
    sentence: 'The blue notebook is hers.', focus: 'hers',
    tip: 'Nothing follows it. “The book is mine” = pronoun. “My book” = determiner. Possessive pronouns never take an apostrophe: “hers,” not “her’s.”',
  },
  {
    group: 'Pronouns', skill: 'reflexive pronoun',
    definition: 'Refers back to the subject when someone or something acts on itself.',
    examples: ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'],
    sentence: 'Maya introduced herself to the class.', focus: 'herself',
    tip: 'The subject and the pronoun refer to the same person or thing. Removing the pronoun changes the meaning or leaves information out.',
  },
  {
    group: 'Pronouns', skill: 'intensive pronoun',
    definition: 'Emphasizes a person or thing without changing the sentence’s main meaning.',
    examples: ['myself', 'yourself', 'himself', 'herself', 'ourselves', 'themselves'],
    sentence: 'The author herself signed my book.', focus: 'herself',
    tip: 'Remove the pronoun. If the sentence still expresses the same main idea, it is intensive.',
  },
  {
    group: 'Pronouns', skill: 'demonstrative pronoun',
    definition: 'Points to a specific person, thing, or idea and stands in for it.',
    examples: ['this', 'that', 'these', 'those'],
    sentence: 'Those belong to my sister.', focus: 'Those',
    tip: 'The pronoun points to something without directly modifying a noun. “Those are mine” = pronoun. “Those shoes” = determiner.',
  },
  {
    group: 'Pronouns', skill: 'indefinite pronoun',
    definition: 'Refers to people, things, or amounts without identifying them specifically.',
    examples: ['someone', 'anyone', 'nothing', 'everybody', 'none', 'each', 'several'],
    sentence: 'Someone left a notebook behind.', focus: 'Someone',
    tip: 'Think “UNDEFINED.” The pronoun does not name exactly who or what it refers to.',
  },
  {
    group: 'Pronouns', skill: 'relative pronoun',
    definition: 'Connects a noun to a clause that gives more information about it.',
    examples: ['who', 'whom', 'whose', 'which', 'that'],
    sentence: 'The student who won the competition smiled.', focus: 'who',
    tip: 'Think “RELATES.” Look for a noun and the extra information connected to it.',
  },
  {
    group: 'Pronouns', skill: 'interrogative pronoun',
    definition: 'Asks or introduces a question about a person or thing.',
    examples: ['who', 'whom', 'whose', 'what', 'which'],
    sentence: 'I wonder who took my pencil.', focus: 'who',
    tip: 'Think “INTERROGATES.” It can introduce a direct or indirect question, even without a question mark.',
  },
];
