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
    "discuss": "Which owner does \"mine\" leave out, and why does \"ours\" fix that?"
  },
  {
    "id": 33,
    "sector": 0,
    "skill": "Common noun",
    "prompt": "Which word is a COUNT noun, one you can number and make plural?",
    "options": [
      "advice",
      "homework",
      "chair",
      "information"
    ],
    "correct": 2,
    "hint": "Could you say 'three ___'?",
    "why": "'Chair' can be counted: one chair, two chairs. 'Advice,' 'homework,' and 'information' are non-count, so you cannot say 'two advices.'",
    "discuss": "Can you say 'three homeworks'? Why or why not?"
  },
  {
    "id": 34,
    "sector": 0,
    "skill": "Plural noun",
    "prompt": "Which sentence has a plural noun spelled INCORRECTLY?",
    "options": [
      "Four dishes were clean.",
      "Two boxes sat by the door.",
      "Three babies slept nearby.",
      "Five boxs were stacked."
    ],
    "correct": 3,
    "hint": "Nouns ending in x usually add -es.",
    "why": "'Boxs' should be 'boxes.' Nouns ending in x, ch, sh, s, or z usually add -es.",
    "discuss": "Why does 'babies' change the y to i, while 'dishes' just adds -es?"
  },
  {
    "id": 35,
    "sector": 0,
    "skill": "Concrete noun",
    "prompt": "Which word names something you could touch?",
    "context": "Her kindness and the warm bread comforted the guests.",
    "options": [
      "kindness",
      "bread",
      "comfort",
      "warmth"
    ],
    "correct": 1,
    "hint": "Use your senses: could you touch it, smell it, or taste it?",
    "why": "'Bread' is a physical object you can touch, smell, and taste. The other words name feelings or qualities.",
    "discuss": "Is 'warmth' concrete or abstract? How do you know?"
  },
  {
    "id": 36,
    "sector": 0,
    "skill": "Collective noun",
    "prompt": "Which phrase contains a collective noun?",
    "options": [
      "three geese",
      "a flock of geese",
      "the goose",
      "one goose"
    ],
    "correct": 1,
    "hint": "Look for one word that names a group.",
    "why": "'Flock' names a group of birds as one unit, so it is a collective noun. 'Geese' names more than one bird, but it does not name a group.",
    "discuss": "What is a collective noun for a group of lions?"
  },
  {
    "id": 37,
    "sector": 0,
    "skill": "Proper noun",
    "prompt": "Which sentence capitalizes proper nouns correctly?",
    "options": [
      "We visited the grand canyon in arizona.",
      "We visited the grand Canyon in Arizona.",
      "We visited the Grand Canyon in arizona.",
      "We visited the Grand Canyon in Arizona."
    ],
    "correct": 3,
    "hint": "Capitalize the names of specific places, not general descriptions.",
    "why": "'Grand Canyon' and 'Arizona' name specific places, so both are capitalized. 'The canyon' used alone is a common noun.",
    "discuss": "Why is 'canyon' lowercase in 'a deep canyon' but capitalized in 'Grand Canyon'?"
  },
  {
    "id": 38,
    "sector": 0,
    "skill": "Common noun",
    "prompt": "Which word is a common noun in this sentence?",
    "context": "Jordan bought a bicycle in Denver, Colorado.",
    "options": [
      "Jordan",
      "Denver",
      "bicycle",
      "Colorado"
    ],
    "correct": 2,
    "hint": "Ask whether the word names one specific person, place, or thing.",
    "why": "'Bicycle' is a general name for a type of vehicle, so it is common. The others name specific people and places.",
    "discuss": "If a bicycle had a brand name, would that word be common or proper? Give an example."
  },
  {
    "id": 39,
    "sector": 0,
    "skill": "Abstract noun",
    "prompt": "Which sentence contains an abstract noun?",
    "options": [
      "The hikers reached the summit.",
      "A bridge crossed the river.",
      "Their patience finally paid off.",
      "The dog barked twice."
    ],
    "correct": 2,
    "hint": "Look for a quality or idea you cannot touch.",
    "why": "'Patience' names a quality, not a physical object. 'Summit,' 'bridge,' and 'dog' are concrete.",
    "discuss": "Which abstract nouns do you hear most often at school?"
  },
  {
    "id": 40,
    "sector": 0,
    "skill": "Plural noun",
    "prompt": "What is the plural of 'knife'?",
    "options": [
      "knifes",
      "knives",
      "knife's",
      "kniven"
    ],
    "correct": 1,
    "hint": "Many words ending in f or fe change to v before adding es.",
    "why": "'Knife' becomes 'knives.' Words such as 'wolf' and 'leaf' follow the same pattern.",
    "discuss": "Why does 'roof' just add s to become 'roofs'?"
  },
  {
    "id": 41,
    "sector": 1,
    "skill": "Personal pronoun",
    "prompt": "Which pronoun completes the sentence correctly? ___ can run faster than Sam.",
    "options": [
      "Me",
      "I",
      "Myself",
      "Mine"
    ],
    "correct": 1,
    "hint": "Is the pronoun doing the action or receiving it?",
    "why": "'I' is the subject form, used when the pronoun does the action. 'Me' is for receiving the action.",
    "discuss": "Does 'Me can run faster' sound right if you remove 'Sam'?"
  },
  {
    "id": 42,
    "sector": 1,
    "skill": "Personal pronoun",
    "prompt": "Which pronoun completes the sentence correctly? The coach asked ___ to bring the ball.",
    "options": [
      "I",
      "me",
      "myself",
      "mine"
    ],
    "correct": 1,
    "hint": "Who receives the request?",
    "why": "'Me' is the object form. It receives the action of asking.",
    "discuss": "Why is 'asked me' correct but 'asked I' is not?"
  },
  {
    "id": 43,
    "sector": 1,
    "skill": "Reflexive pronoun",
    "prompt": "Which sentence uses 'myself' correctly?",
    "options": [
      "Myself and Lena went home.",
      "I hurt myself on the stairs.",
      "Myself wants a snack.",
      "Please call myself tomorrow."
    ],
    "correct": 1,
    "hint": "Does 'myself' refer back to the subject 'I'?",
    "why": "'Myself' refers back to 'I,' the subject who was hurt. The other sentences use 'myself' with no matching subject.",
    "discuss": "How would you correct the first sentence so it uses 'I' correctly?"
  },
  {
    "id": 44,
    "sector": 1,
    "skill": "Interrogative pronoun",
    "prompt": "Which question uses 'whom' correctly?",
    "options": [
      "Whom is at the door?",
      "To whom did you give the note?",
      "Whom wants to play?",
      "Whom finished first?"
    ],
    "correct": 1,
    "hint": "Is the word the object of a preposition such as 'to' or 'for'?",
    "why": "'Whom' is the object form, here after the preposition 'to.' When the question word is the subject, use 'who.'",
    "discuss": "Rewrite 'Whom is at the door?' using 'who.'"
  },
  {
    "id": 45,
    "sector": 1,
    "skill": "Demonstrative pronoun",
    "prompt": "Which word completes the sentence correctly? ___ is the best idea yet.",
    "options": [
      "This",
      "Who",
      "Mine",
      "Everyone"
    ],
    "correct": 0,
    "hint": "Which word points to a specific idea?",
    "why": "'This' points to a specific idea and stands in as the subject, so it is a demonstrative pronoun.",
    "discuss": "Which demonstrative pronoun would you use for an idea that is far away?"
  },
  {
    "id": 46,
    "sector": 1,
    "skill": "Indefinite pronoun",
    "prompt": "Which word is an indefinite pronoun?",
    "options": [
      "Maria",
      "nobody",
      "gray",
      "quickly"
    ],
    "correct": 1,
    "hint": "Does this word refer to people or things without naming a specific one?",
    "why": "'Nobody' refers to no person in particular, so it is indefinite. 'Maria' is a proper noun, 'gray' an adjective, and 'quickly' an adverb.",
    "discuss": "Which verb fits here: 'Nobody ___ here yet'? Why?"
  },
  {
    "id": 47,
    "sector": 1,
    "skill": "Relative pronoun",
    "prompt": "Choose the relative pronoun that completes the sentence: The book ___ I borrowed was overdue.",
    "options": [
      "which",
      "why",
      "myself",
      "they"
    ],
    "correct": 0,
    "hint": "The word should join a clause to the noun 'book.'",
    "why": "'Which' introduces the clause 'I borrowed,' which describes 'book.'",
    "discuss": "Can you use 'that' here too? What does that tell you about relative pronouns?"
  },
  {
    "id": 48,
    "sector": 1,
    "skill": "Possessive pronoun",
    "prompt": "Which sentence uses a possessive PRONOUN standing alone?",
    "options": [
      "Her bike is red.",
      "That bike is hers.",
      "The bike is her's.",
      "Hers bike is red."
    ],
    "correct": 1,
    "hint": "A possessive pronoun stands alone, without a noun after it.",
    "why": "'Hers' stands alone and shows ownership. 'Her bike' uses 'her' before a noun, and possessive pronouns never take an apostrophe.",
    "discuss": "Which other possessive pronoun could replace 'hers' in this sentence?"
  },
  {
    "id": 49,
    "sector": 2,
    "skill": "Possessive pronoun",
    "prompt": "Which sentence uses 'its' correctly?",
    "options": [
      "The dog wagged it's tail.",
      "The dog wagged its tail.",
      "The dog wagged its' tail.",
      "The dog wagged it tail."
    ],
    "correct": 1,
    "hint": "'It's' is short for 'it is.' Does the sentence mean 'it is'?",
    "why": "'Its' is a possessive pronoun, like 'hers.' It never takes an apostrophe. 'It's' means 'it is' or 'it has.'",
    "discuss": "Test it: replace the word with 'it is.' Does the sentence still make sense?"
  },
  {
    "id": 50,
    "sector": 2,
    "skill": "Possessive pronoun",
    "prompt": "Which sentence correctly says 'you are going to love the museum'?",
    "options": [
      "Your going to love the museum.",
      "You're going to love the museum.",
      "Youre going to love the museum.",
      "Your' going to love the museum."
    ],
    "correct": 1,
    "hint": "Can you replace the word with 'you are'?",
    "why": "'You're' means 'you are.' 'Your' shows ownership, as in 'your backpack.'",
    "discuss": "Which word goes in this blank: '___ backpack is on the floor'?"
  },
  {
    "id": 51,
    "sector": 2,
    "skill": "Plural noun",
    "prompt": "Which correction fixes 'The childrens toys were everywhere'?",
    "options": [
      "The children's toys were everywhere.",
      "The childrens' toys were everywhere.",
      "The child's toys were everywhere.",
      "The children toys were everywhere."
    ],
    "correct": 0,
    "hint": "'Children' is an irregular plural. It does not add s.",
    "why": "'Children' is already plural and irregular, so possession is shown with 's: 'children's toys.' Adding s to make 'childrens' is wrong.",
    "discuss": "What is the plural of 'child' in a sentence with no ownership?"
  },
  {
    "id": 52,
    "sector": 2,
    "skill": "Personal pronoun",
    "prompt": "Which correction fixes 'Me and Sam went to the store'?",
    "options": [
      "Sam and I went to the store.",
      "Sam and me went to the store.",
      "Sam and myself went to the store.",
      "Sam and mine went to the store."
    ],
    "correct": 0,
    "hint": "Remove Sam. Which fits: 'Me went to the store' or 'I went to the store'?",
    "why": "Subject pronouns (I, we, he, she, they) do the action. 'I went' is correct, so 'Sam and I' is correct.",
    "discuss": "Why is 'Me went' wrong, even though 'me' is correct in 'asked me'?"
  },
  {
    "id": 53,
    "sector": 2,
    "skill": "Possessive noun",
    "prompt": "Which sentence correctly shows that ONE woman owns the bags?",
    "options": [
      "The womans' bags were heavy.",
      "The women's bags were heavy.",
      "The woman's bags were heavy.",
      "The woman bags were heavy."
    ],
    "correct": 2,
    "hint": "One owner: add 's to the singular noun.",
    "why": "'Woman's' is a singular possessive, showing that one woman owns the bags. 'Women's' would mean several women own them.",
    "discuss": "How would you write the sentence if three women shared the bags?"
  },
  {
    "id": 54,
    "sector": 2,
    "skill": "Personal pronoun",
    "prompt": "Which pronoun replaces the second 'the students' in this sentence? The students said the students would arrive late.",
    "options": [
      "they",
      "it",
      "theirs",
      "them"
    ],
    "correct": 0,
    "hint": "The second phrase is the subject of 'would arrive.'",
    "why": "'They' is a subject pronoun that replaces a group of people. 'Them' is an object pronoun, and 'theirs' shows ownership.",
    "discuss": "Could you replace it with 'them'? Why not?"
  },
  {
    "id": 55,
    "sector": 2,
    "skill": "Common noun",
    "prompt": "Which sentence correctly uses a non-count noun?",
    "options": [
      "Please bring me two waters.",
      "Please bring me some water.",
      "Please bring me a homeworks.",
      "Please bring me three furnitures."
    ],
    "correct": 1,
    "hint": "Non-count nouns such as water, advice, and furniture do not take a plural s.",
    "why": "'Water' is a non-count noun. Use words such as 'some' or 'a glass of' instead of counting it.",
    "discuss": "What other non-count nouns can you think of?"
  },
  {
    "id": 56,
    "sector": 2,
    "skill": "Plural noun",
    "prompt": "What is the plural of 'moose'?",
    "options": [
      "mooses",
      "meese",
      "moose",
      "moosen"
    ],
    "correct": 2,
    "hint": "Some animal names stay the same in the plural.",
    "why": "'Moose' is one of the few nouns whose singular and plural are the same. Other examples are 'deer' and 'sheep.'",
    "discuss": "Why do you think English keeps the same form for some words?"
  },
  {
    "id": 57,
    "sector": 3,
    "skill": "Possessive pronoun",
    "prompt": "Which word completes the sentence correctly? The class finished ___ project.",
    "options": [
      "its",
      "their",
      "it's",
      "they"
    ],
    "correct": 0,
    "hint": "'Class' is one group. In American English, use the singular possessive.",
    "why": "In American English, a collective noun like 'class' is treated as singular, so the possessive is 'its.' British English often uses 'their' instead.",
    "discuss": "Which word fits if each member of the class finished their own project?"
  },
  {
    "id": 58,
    "sector": 3,
    "skill": "Relative pronoun",
    "prompt": "Which word does 'which' refer to in: We ate pasta, which was cold?",
    "options": [
      "pasta",
      "We",
      "ate",
      "cold"
    ],
    "correct": 0,
    "hint": "Ask what 'which' describes.",
    "why": "'Which' refers to 'pasta.' The clause 'which was cold' describes the pasta.",
    "discuss": "Why would 'who was cold' be wrong here?"
  },
  {
    "id": 59,
    "sector": 3,
    "skill": "Indefinite pronoun",
    "prompt": "Which sentence uses 'Everyone' with the correct verb?",
    "options": [
      "Everyone were invited.",
      "Everyone was invited.",
      "Everyone are invited.",
      "Everyone be invited."
    ],
    "correct": 1,
    "hint": "'Everyone' is singular in standard grammar.",
    "why": "'Everyone' is an indefinite pronoun that takes a singular verb, so 'was' is correct.",
    "discuss": "Does 'everybody' follow the same rule?"
  },
  {
    "id": 60,
    "sector": 3,
    "skill": "Demonstrative pronoun",
    "prompt": "Which word in this sentence is a demonstrative pronoun? Those who arrived early got the best seats.",
    "options": [
      "Those",
      "who",
      "early",
      "seats"
    ],
    "correct": 0,
    "hint": "Which word points to specific people and stands alone?",
    "why": "'Those' points to specific people and stands in as the subject. 'Who' introduces a clause about those people, so it is relative.",
    "discuss": "Can you find a demonstrative pronoun in something you wrote today?"
  },
  {
    "id": 61,
    "sector": 3,
    "skill": "Possessive pronoun",
    "prompt": "Which sentence uses a possessive pronoun correctly?",
    "options": [
      "The dog's bowl is her's.",
      "The dog's bowl is hers.",
      "The dogs bowl is hers'.",
      "Hers' bowl is the dog."
    ],
    "correct": 1,
    "hint": "Possessive pronouns never take an apostrophe.",
    "why": "'Hers' is the correct possessive pronoun. 'Her's,' 'hers',' and 'Hers'' all add an apostrophe that does not belong.",
    "discuss": "Why does 'its' follow the same rule as 'hers'?"
  },
  {
    "id": 62,
    "sector": 3,
    "skill": "Abstract noun",
    "prompt": "Which sentence uses an abstract noun as its subject?",
    "options": [
      "The apple fell.",
      "The team cheered.",
      "Honesty matters to our team.",
      "Mr. Lopez laughed."
    ],
    "correct": 2,
    "hint": "The subject is the word doing the action. What 'matters' here?",
    "why": "'Honesty' is an abstract quality and is the subject of 'matters.' The other subjects are concrete (apple, Mr. Lopez) or collective (team).",
    "discuss": "What abstract noun could be the subject of a sentence about your class?"
  },
  {
    "id": 63,
    "sector": 3,
    "skill": "Personal pronoun",
    "prompt": "In this sentence, who does 'they' refer to?",
    "context": "The bakers baked bread, and they sold it at noon.",
    "focus": "they",
    "options": [
      "bread",
      "the bakers",
      "noon",
      "it"
    ],
    "correct": 1,
    "hint": "Which group of people made the bread?",
    "why": "'They' refers back to 'the bakers,' the people who baked and sold the bread. 'It' refers to the bread.",
    "discuss": "What does 'it' refer to, and how do you know?"
  },
  {
    "id": 64,
    "sector": 3,
    "skill": "Proper noun",
    "prompt": "Which word in this sentence is a proper noun?",
    "context": "Our neighbor adopted a puppy from Seattle.",
    "options": [
      "neighbor",
      "puppy",
      "Seattle",
      "adopted"
    ],
    "correct": 2,
    "hint": "Look for the name of one specific place.",
    "why": "'Seattle' is a specific city name, so it is a proper noun. 'Neighbor' and 'puppy' are common nouns, and 'adopted' is a verb.",
    "discuss": "Why is 'neighbor' lowercase, even though it describes one specific person?"
  }
];
export const CHAMBERS = ["Noun Forge", "Pronoun Portal", "Repair Lab", "Master Lock"];
