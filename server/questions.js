// Original 32 Word Vault questions; imported SERVER-SIDE ONLY.
export const QUESTIONS = [
  {
    "id": 1,
    "sector": 0,
    "skill": "Singular noun",
    "prompt": "Which label describes the highlighted noun?",
    "context": "The lantern flickered in the attic.",
    "focus": "lantern",
    "options": [
      "Collective noun",
      "Singular noun",
      "Plural noun",
      "Abstract noun"
    ],
    "correct": 1,
    "hint": "Count how many lanterns the noun names.",
    "why": "“Lantern” names one item, so it is singular.",
    "discuss": "What change would make the noun plural?"
  },
  {
    "id": 2,
    "sector": 0,
    "skill": "Plural noun",
    "prompt": "Which label describes the highlighted noun?",
    "context": "Several geese crossed the path.",
    "focus": "geese",
    "options": [
      "Plural noun",
      "Possessive noun",
      "Singular noun",
      "Collective noun"
    ],
    "correct": 0,
    "hint": "Does this word mean one goose or more than one?",
    "why": "“Geese” is the irregular plural of “goose”; it names more than one.",
    "discuss": "Why is “geeses” not standard English?"
  },
  {
    "id": 3,
    "sector": 0,
    "skill": "Possessive noun",
    "prompt": "What form of noun is highlighted?",
    "context": "The pilot’s map was soaked.",
    "focus": "pilot’s",
    "options": [
      "Plural noun",
      "Abstract noun",
      "Possessive noun",
      "Proper noun"
    ],
    "correct": 2,
    "hint": "Ask whose map it is.",
    "why": "“Pilot’s” shows that the map belongs to one pilot; the apostrophe marks possession.",
    "discuss": "What would change if the map belonged to several pilots?"
  },
  {
    "id": 4,
    "sector": 0,
    "skill": "Proper noun",
    "prompt": "Which label explains why the highlighted name is capitalized?",
    "context": "Maya hiked through Yellowstone National Park.",
    "focus": "Yellowstone National Park",
    "options": [
      "Common noun",
      "Collective noun",
      "Proper noun",
      "Plural noun"
    ],
    "correct": 2,
    "hint": "Is this a general kind of place or the name of one specific place?",
    "why": "“Yellowstone National Park” is the specific name of a place, making it a proper noun.",
    "discuss": "Can a proper noun also be concrete? Explain."
  },
  {
    "id": 5,
    "sector": 0,
    "skill": "Common noun",
    "prompt": "Which category best describes the highlighted word?",
    "context": "A scientist examined the soil.",
    "focus": "scientist",
    "options": [
      "Common noun",
      "Proper noun",
      "Collective noun",
      "Abstract noun"
    ],
    "correct": 0,
    "hint": "It names a type of person, not an individual by name.",
    "why": "“Scientist” is a general name for a person, so it is a common noun.",
    "discuss": "How could you replace it with a proper noun?"
  },
  {
    "id": 6,
    "sector": 0,
    "skill": "Collective noun",
    "prompt": "What kind of noun is highlighted?",
    "context": "The committee reached a decision.",
    "focus": "committee",
    "options": [
      "Plural noun",
      "Collective noun",
      "Proper noun",
      "Possessive noun"
    ],
    "correct": 1,
    "hint": "One word names a group acting together.",
    "why": "“Committee” is a collective noun because it names a group as a unit.",
    "discuss": "Is a collective noun always grammatically plural?"
  },
  {
    "id": 7,
    "sector": 0,
    "skill": "Concrete noun",
    "prompt": "Which label describes what the highlighted noun names?",
    "context": "Cold rain tapped on the window.",
    "focus": "rain",
    "options": [
      "Abstract noun",
      "Concrete noun",
      "Collective noun",
      "Proper noun"
    ],
    "correct": 1,
    "hint": "Could you perceive the thing with your senses?",
    "why": "“Rain” refers to a physical thing you can see or feel, so it is concrete.",
    "discuss": "Is a sound a concrete noun even if you cannot hold it?"
  },
  {
    "id": 8,
    "sector": 0,
    "skill": "Abstract noun",
    "prompt": "Which label describes what the highlighted noun names?",
    "context": "Her courage helped the climber continue.",
    "focus": "courage",
    "options": [
      "Collective noun",
      "Concrete noun",
      "Plural noun",
      "Abstract noun"
    ],
    "correct": 3,
    "hint": "Can the idea be physically touched?",
    "why": "“Courage” names a quality rather than a physical object, so it is abstract.",
    "discuss": "How can an abstract noun have real-world effects?"
  },
  {
    "id": 9,
    "sector": 1,
    "skill": "Personal pronoun",
    "prompt": "What kind of pronoun is highlighted?",
    "context": "They rehearsed after school.",
    "focus": "They",
    "options": [
      "Personal pronoun",
      "Relative pronoun",
      "Indefinite pronoun",
      "Interrogative pronoun"
    ],
    "correct": 0,
    "hint": "The word refers to participants without naming them.",
    "why": "“They” is a personal pronoun standing in for people previously identified or understood from context.",
    "discuss": "How might the sentence change if “they” referred to one person?"
  },
  {
    "id": 10,
    "sector": 1,
    "skill": "Possessive pronoun",
    "prompt": "What kind of pronoun is highlighted?",
    "context": "That notebook is hers.",
    "focus": "hers",
    "options": [
      "Reflexive pronoun",
      "Personal pronoun",
      "Possessive pronoun",
      "Demonstrative pronoun"
    ],
    "correct": 2,
    "hint": "It stands alone and identifies who owns the notebook.",
    "why": "“Hers” is a possessive pronoun because it replaces a noun phrase and shows ownership.",
    "discuss": "Why does “hers” not need an apostrophe?"
  },
  {
    "id": 11,
    "sector": 1,
    "skill": "Reflexive pronoun",
    "prompt": "What is the job of the highlighted pronoun?",
    "context": "Amina reminded herself to breathe.",
    "focus": "herself",
    "options": [
      "Intensive pronoun",
      "Reflexive pronoun",
      "Indefinite pronoun",
      "Relative pronoun"
    ],
    "correct": 1,
    "hint": "Who receives the action of “reminded”?",
    "why": "“Herself” refers back to Amina and is needed to complete what she reminded; it is reflexive.",
    "discuss": "What happens to the meaning if you remove “herself”?"
  },
  {
    "id": 12,
    "sector": 1,
    "skill": "Intensive pronoun",
    "prompt": "What is the job of the highlighted pronoun?",
    "context": "The principal herself announced the winners.",
    "focus": "herself",
    "options": [
      "Personal pronoun",
      "Indefinite pronoun",
      "Intensive pronoun",
      "Reflexive pronoun"
    ],
    "correct": 2,
    "hint": "Try removing the pronoun. The basic sentence still works.",
    "why": "“Herself” simply emphasizes “the principal.” It can be removed without changing the core meaning, making it intensive.",
    "discuss": "What is the difference between emphasis and receiving an action?"
  },
  {
    "id": 13,
    "sector": 1,
    "skill": "Interrogative pronoun",
    "prompt": "What kind of pronoun is highlighted?",
    "context": "Who left the window open?",
    "focus": "Who",
    "options": [
      "Relative pronoun",
      "Personal pronoun",
      "Interrogative pronoun",
      "Indefinite pronoun"
    ],
    "correct": 2,
    "hint": "The word asks for an identity.",
    "why": "“Who” is interrogative because it introduces a question about a person.",
    "discuss": "Can “who” ever be a relative pronoun?"
  },
  {
    "id": 14,
    "sector": 1,
    "skill": "Relative pronoun",
    "prompt": "What kind of pronoun is highlighted?",
    "context": "The neighbor who rescued the dog waved.",
    "focus": "who",
    "options": [
      "Interrogative pronoun",
      "Relative pronoun",
      "Demonstrative pronoun",
      "Personal pronoun"
    ],
    "correct": 1,
    "hint": "The word joins a description to “neighbor.”",
    "why": "“Who” introduces the relative clause “who rescued the dog,” describing “neighbor.”",
    "discuss": "What information does the relative clause add?"
  },
  {
    "id": 15,
    "sector": 1,
    "skill": "Demonstrative pronoun",
    "prompt": "What kind of pronoun is highlighted?",
    "context": "Those are the missing keys.",
    "focus": "Those",
    "options": [
      "Possessive pronoun",
      "Relative pronoun",
      "Demonstrative pronoun",
      "Indefinite pronoun"
    ],
    "correct": 2,
    "hint": "The word points to particular things and stands alone.",
    "why": "“Those” points out specific objects without naming them, so it is a demonstrative pronoun.",
    "discuss": "How is “those” different in “those keys”?"
  },
  {
    "id": 16,
    "sector": 1,
    "skill": "Indefinite pronoun",
    "prompt": "What kind of pronoun is highlighted?",
    "context": "Someone misplaced the tickets.",
    "focus": "Someone",
    "options": [
      "Relative pronoun",
      "Indefinite pronoun",
      "Personal pronoun",
      "Interrogative pronoun"
    ],
    "correct": 1,
    "hint": "The identity of the person is not specified.",
    "why": "“Someone” refers to an unspecified person, making it an indefinite pronoun.",
    "discuss": "How would the meaning change if you replaced it with “Maya”?"
  },
  {
    "id": 17,
    "sector": 2,
    "skill": "Possessive noun",
    "prompt": "Which sentence correctly shows that ONE fox owns the den?",
    "context": "",
    "focus": "",
    "options": [
      "The foxes’ den is hidden.",
      "The fox’s den is hidden.",
      "The foxs’ den is hidden.",
      "The foxes den is hidden."
    ],
    "correct": 1,
    "hint": "One fox + ownership usually takes apostrophe-s.",
    "why": "“Fox’s” shows ownership by one fox. “Foxes’” would show ownership by multiple foxes.",
    "discuss": "What would you write if two foxes owned the den?"
  },
  {
    "id": 18,
    "sector": 2,
    "skill": "Possessive noun",
    "prompt": "Which sentence correctly shows that SEVERAL students jointly own one project?",
    "context": "",
    "focus": "",
    "options": [
      "The student’s project is ready.",
      "The students’s project is ready.",
      "The students’ project is ready.",
      "The students project is ready."
    ],
    "correct": 2,
    "hint": "The plural “students” already ends in s.",
    "why": "“Students’” is plural possessive: the apostrophe follows the final s.",
    "discuss": "What clues tell you whether the owners are singular or plural?"
  },
  {
    "id": 19,
    "sector": 2,
    "skill": "Plural noun",
    "prompt": "Which sentence contains the correct plural of “mouse”?",
    "context": "",
    "focus": "",
    "options": [
      "Two mouse crossed the floor.",
      "Two mouse’s crossed the floor.",
      "Two mouses crossed the floor.",
      "Two mice crossed the floor."
    ],
    "correct": 3,
    "hint": "Some plurals change the vowel instead of adding s.",
    "why": "“Mice” is the irregular plural of “mouse”; an apostrophe does not make a noun plural.",
    "discuss": "Name another irregular plural noun."
  },
  {
    "id": 20,
    "sector": 2,
    "skill": "Proper noun",
    "prompt": "Which choice is a proper noun rather than a common noun?",
    "context": "",
    "focus": "",
    "options": [
      "lake",
      "Lake Michigan",
      "river",
      "city"
    ],
    "correct": 1,
    "hint": "Look for a specific name, not a general category.",
    "why": "“Lake Michigan” names one particular lake, so it is proper. “Lake” by itself is common.",
    "discuss": "Why is “lake” lowercase in “the lake was frozen”?"
  },
  {
    "id": 21,
    "sector": 2,
    "skill": "Reflexive pronoun",
    "prompt": "Which sentence uses a reflexive pronoun?",
    "context": "",
    "focus": "",
    "options": [
      "Nadia herself directed the scene.",
      "Nadia taught herself to juggle.",
      "Nadia said that was funny.",
      "Nadia gave her friend a book."
    ],
    "correct": 1,
    "hint": "Find where the subject also receives the action.",
    "why": "In “Nadia taught herself,” the subject Nadia is also the learner; “herself” is reflexive.",
    "discuss": "Why is “herself” intensive in the first answer choice?"
  },
  {
    "id": 22,
    "sector": 2,
    "skill": "Intensive pronoun",
    "prompt": "Which sentence uses an intensive pronoun?",
    "context": "",
    "focus": "",
    "options": [
      "The coach praised himself.",
      "The coach saw him.",
      "The coach himself made the announcement.",
      "The coach asked who was ready."
    ],
    "correct": 2,
    "hint": "The pronoun adds emphasis and can be removed.",
    "why": "“The coach himself” emphasizes that the coach personally made the announcement; “himself” is optional and intensive.",
    "discuss": "What changes if you remove “himself”?"
  },
  {
    "id": 23,
    "sector": 2,
    "skill": "Relative pronoun",
    "prompt": "Which sentence uses a relative pronoun to add a description?",
    "context": "",
    "focus": "",
    "options": [
      "What won the prize?",
      "That is the winning novel.",
      "Someone won the prize.",
      "The novel that won the prize sold out."
    ],
    "correct": 3,
    "hint": "Look for a word introducing a clause that modifies “novel.”",
    "why": "“That” joins “won the prize” to “the novel,” functioning as a relative pronoun.",
    "discuss": "Is “that” always a relative pronoun?"
  },
  {
    "id": 24,
    "sector": 2,
    "skill": "Possessive pronoun",
    "prompt": "Which sentence correctly uses a possessive pronoun?",
    "context": "",
    "focus": "",
    "options": [
      "The umbrella is mines.",
      "The umbrella is mine.",
      "My is the umbrella.",
      "The umbrella is their’s."
    ],
    "correct": 1,
    "hint": "The possessive pronoun can stand on its own.",
    "why": "“Mine” is the correct standalone possessive pronoun. “My” normally accompanies a noun; possessive pronouns do not take apostrophes.",
    "discuss": "What other pronoun could replace “mine”?"
  },
  {
    "id": 25,
    "sector": 3,
    "skill": "Demonstrative pronoun",
    "prompt": "In which sentence is “that” a DEMONSTRATIVE PRONOUN?",
    "context": "",
    "focus": "",
    "options": [
      "That song is beautiful.",
      "The song that Jun played was beautiful.",
      "Jun said that the song was beautiful.",
      "That belongs to Jun."
    ],
    "correct": 3,
    "hint": "It must point to something and stand alone, not modify a following noun.",
    "why": "In “That belongs to Jun,” “that” points to an item and stands as the subject. In “that song,” it is a determiner; in “song that,” it is relative.",
    "discuss": "Why does the grammatical job of “that” depend on context?"
  },
  {
    "id": 26,
    "sector": 3,
    "skill": "Relative pronoun",
    "prompt": "Which sentence uses “who” as a RELATIVE pronoun?",
    "context": "",
    "focus": "",
    "options": [
      "Who won the medal?",
      "The runner who finished first waved.",
      "Who is at the door?",
      "Who wants to race?"
    ],
    "correct": 1,
    "hint": "Find a description attached to a noun rather than a direct question.",
    "why": "“Who finished first” is a relative clause describing “runner.” The other uses ask questions.",
    "discuss": "Could you remove the relative clause and keep the main sentence?"
  },
  {
    "id": 27,
    "sector": 3,
    "skill": "Collective noun",
    "prompt": "Which sentence contains a collective noun?",
    "context": "",
    "focus": "",
    "options": [
      "Several jurors disagreed.",
      "The verdict surprised us.",
      "The jury disagreed.",
      "A judge entered the room."
    ],
    "correct": 2,
    "hint": "Seek a single noun naming a whole group.",
    "why": "“Jury” names people as one group, so it is collective; “jurors” simply names multiple individuals.",
    "discuss": "Why is “jury” collective even when its members disagree?"
  },
  {
    "id": 28,
    "sector": 3,
    "skill": "Abstract noun",
    "prompt": "Which highlighted idea is an abstract noun in this sentence?",
    "context": "The crew celebrated its victory beside the statue.",
    "focus": "victory",
    "options": [
      "crew",
      "statue",
      "victory",
      "beside"
    ],
    "correct": 2,
    "hint": "Look for the idea or outcome rather than a person or an object.",
    "why": "“Victory” names a concept or achievement, not a touchable object. “Crew” is collective; “statue” is concrete.",
    "discuss": "Could the same sentence have multiple noun categories?"
  },
  {
    "id": 29,
    "sector": 3,
    "skill": "Indefinite pronoun",
    "prompt": "Which sentence uses an indefinite pronoun as its SUBJECT?",
    "context": "",
    "focus": "",
    "options": [
      "Those were cheering.",
      "Everyone cheered.",
      "The crowd cheered.",
      "He cheered."
    ],
    "correct": 1,
    "hint": "The subject must refer to people without identifying them specifically.",
    "why": "“Everyone” is an indefinite pronoun serving as the subject of “cheered.”",
    "discuss": "Does “everyone” take a singular or plural verb in standard English?"
  },
  {
    "id": 30,
    "sector": 3,
    "skill": "Proper noun",
    "prompt": "Which sentence contains a proper noun in possessive form?",
    "context": "",
    "focus": "",
    "options": [
      "The artist’s sketch won.",
      "Her sketch won.",
      "Sofia drew a sketch.",
      "Sofia’s sketch won."
    ],
    "correct": 3,
    "hint": "Find a specific person’s name that also shows ownership.",
    "why": "“Sofia’s” is both a proper noun (a name) and a possessive noun (showing ownership). Noun categories can overlap.",
    "discuss": "Why is there no contradiction in being both proper and possessive?"
  },
  {
    "id": 31,
    "sector": 3,
    "skill": "Intensive pronoun",
    "prompt": "Which explanation of “herself” is correct in “The engineer herself solved it”?",
    "context": "",
    "focus": "",
    "options": [
      "It is reflexive because the engineer receives the action.",
      "It is intensive because it adds removable emphasis.",
      "It is relative because it joins two clauses.",
      "It is indefinite because the person is unknown."
    ],
    "correct": 1,
    "hint": "Remove the word “herself.” Does the core sentence still work?",
    "why": "“Herself” emphasizes that the engineer solved the problem personally. “The engineer solved it” still works, so it is intensive.",
    "discuss": "Change the sentence so that “herself” becomes reflexive."
  },
  {
    "id": 32,
    "sector": 3,
    "skill": "Possessive pronoun",
    "prompt": "Which replacement preserves “The books belong to Luis and me”?",
    "context": "",
    "focus": "",
    "options": [
      "They are mine.",
      "They are his.",
      "They are theirs.",
      "They are ours."
    ],
    "correct": 3,
    "hint": "Include the speaker AND Luis in the group of owners.",
    "why": "“Ours” means belonging to us, including the speaker and Luis. “Mine” leaves Luis out.",
    "discuss": "Why is “our” not a replacement in “They are ___”?"
  }
];
export const CHAMBERS = ["Noun Forge", "Pronoun Portal", "Repair Lab", "Master Lock"];
