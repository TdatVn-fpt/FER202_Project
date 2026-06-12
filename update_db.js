const fs = require('fs');

const dbPath = 'db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.courses = [
  {
    "id": "course-001",
    "title": "IELTS Reading: Essential Strategies",
    "description": "Master core reading skills to achieve Band 6.5+. This comprehensive course covers Skimming, Scanning, and how to effectively tackle True/False/Not Given and Matching Headings questions under time pressure.",
    "syllabus": [
      "Introduction to Skimming and Scanning",
      "Mastering True/False/Not Given",
      "Matching Headings like a Pro",
      "Summary Completion & Flowcharts"
    ],
    "skill": "Reading",
    "level": "Band 5.0 - 6.5",
    "price": 0,
    "isPremium": false,
    "thumbnail": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    "teacherId": "u-teacher-001",
    "teacherName": "IELTS Mentor",
    "status": "approved",
    "enrolledCount": 120,
    "rating": 4.7,
    "durationWeeks": 6,
    "createdAt": "2026-06-01T08:00:00Z"
  },
  {
    "id": "course-002",
    "title": "IELTS Listening: Score Booster",
    "description": "Enhance your listening comprehension with authentic IELTS materials. Learn how to anticipate answers, deal with distractors, and understand diverse accents in Sections 3 & 4.",
    "syllabus": [
      "Section 1: Form Completion",
      "Section 2: Map & Diagram Labelling",
      "Section 3: Multiple Choice & Matching",
      "Section 4: Academic Lecture Completion"
    ],
    "skill": "Listening",
    "level": "Band 6.0 - 7.5+",
    "price": 199000,
    "isPremium": true,
    "thumbnail": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80",
    "teacherId": "u-teacher-001",
    "teacherName": "IELTS Mentor",
    "status": "approved",
    "enrolledCount": 85,
    "rating": 4.5,
    "durationWeeks": 8,
    "createdAt": "2026-06-02T08:00:00Z"
  },
  {
    "id": "course-003",
    "title": "IELTS Writing Task 2: Advanced Essays",
    "description": "A deep dive into IELTS Writing Task 2. Learn how to structure Band 7.0+ essays, develop complex arguments, and use advanced Lexical Resource and Grammatical Range.",
    "syllabus": [
      "Understanding the Band Descriptors",
      "The Opinion Essay (Agree/Disagree)",
      "Discussion & Double Question Essays",
      "Advanced Cohesion and Coherence"
    ],
    "skill": "Writing",
    "level": "Band 6.5 - 8.0",
    "price": 299000,
    "isPremium": true,
    "thumbnail": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
    "teacherId": "u-teacher-001",
    "teacherName": "IELTS Mentor",
    "status": "approved",
    "enrolledCount": 64,
    "rating": 4.8,
    "durationWeeks": 8,
    "createdAt": "2026-06-03T08:00:00Z"
  },
  {
    "id": "course-004",
    "title": "IELTS Speaking: Fluency & Pronunciation",
    "description": "Build immense confidence for the Speaking test. We cover idiomatic language, intonation, and how to deliver extended, coherent answers in Parts 2 and 3.",
    "syllabus": [
      "Part 1: Natural Responses & Expansion",
      "Part 2: The 1-Minute Prep Strategy",
      "Part 3: Developing Analytical Answers",
      "Pronunciation: Word Stress & Linking"
    ],
    "skill": "Speaking",
    "level": "Band 5.5 - 7.5",
    "price": 0,
    "isPremium": false,
    "thumbnail": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
    "teacherId": "u-teacher-001",
    "teacherName": "IELTS Mentor",
    "status": "approved",
    "enrolledCount": 95,
    "rating": 4.6,
    "durationWeeks": 4,
    "createdAt": "2026-06-04T08:00:00Z"
  },
  {
    "id": "course-005",
    "title": "IELTS Academic Writing Task 1",
    "description": "Step-by-step guide to summarizing visual data. Learn the essential vocabulary for trends, comparisons, processes, and maps to secure a high band score in Task 1.",
    "syllabus": [
      "Line Graphs & Bar Charts (Trends)",
      "Pie Charts & Tables (Comparisons)",
      "Describing Processes & Cycles",
      "Comparing Maps (Past & Present)"
    ],
    "skill": "Writing",
    "level": "Band 6.0+",
    "price": 199000,
    "isPremium": true,
    "thumbnail": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    "teacherId": "u-teacher-001",
    "teacherName": "IELTS Mentor",
    "status": "approved",
    "enrolledCount": 52,
    "rating": 4.4,
    "durationWeeks": 6,
    "createdAt": "2026-06-05T08:00:00Z"
  },
  {
    "id": "course-006",
    "title": "IELTS Reading: The 8.0+ Masterclass",
    "description": "For high-achievers. Tackle the most difficult passages (Passage 3) with advanced techniques. Overcome distractors and tricky inference questions.",
    "syllabus": [
      "Deconstructing Complex Sentences",
      "Identifying the Writer's Views/Claims",
      "Advanced Multiple Choice Strategies",
      "Time Management for Passage 3"
    ],
    "skill": "Reading",
    "level": "Band 7.0 - 9.0",
    "price": 349000,
    "isPremium": true,
    "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    "teacherId": "u-teacher-001",
    "teacherName": "IELTS Mentor",
    "status": "approved",
    "enrolledCount": 38,
    "rating": 4.9,
    "durationWeeks": 10,
    "createdAt": "2026-06-06T08:00:00Z"
  }
];

const newLessons = [
  {
    "id": "lesson-001",
    "courseId": "course-001",
    "title": "Introduction to Skimming and Scanning",
    "order": 1,
    "durationMinutes": 45,
    "content": "Skimming and Scanning are foundational skills for IELTS Reading. You have exactly 60 minutes to read 3 long passages and answer 40 questions. You simply cannot read every word.\n\n## 1. Skimming (Reading for Gist)\nSkimming involves reading a text rapidly to get a general overview of the material. \n**How to Skim effectively:**\n- Read the Title and any Subtitles.\n- Read the First Paragraph carefully (this usually introduces the main topic).\n- Read the First Sentence of every subsequent paragraph (the topic sentence).\n- Look for repeated words, names, dates, or numbers.\n- Read the Final Paragraph (often contains the conclusion or summary).\n\n## 2. Scanning (Reading for Specific Information)\nScanning involves running your eyes quickly over the text to locate specific facts or keywords, without reading the text as a whole.\n**How to Scan effectively:**\n- Identify the **keywords** in the question first (e.g., proper nouns, dates, technical terms).\n- Visualize these keywords.\n- Move your eyes quickly across and down the text, looking *only* for these specific words or their synonyms.\n- Once you find the keyword, read the surrounding sentence carefully to find the answer.\n\n### Practical Exercise:\nTry to find the date **'1985'** in a news article as fast as you can. Notice how your brain ignores other words and only looks for numbers."
  },
  {
    "id": "lesson-002",
    "courseId": "course-001",
    "title": "Mastering True/False/Not Given",
    "order": 2,
    "durationMinutes": 55,
    "content": "True/False/Not Given (T/F/NG) questions are notoriously tricky. They test your ability to understand factual information.\n\n## The Definitions\n- **TRUE**: The statement agrees exactly with the information in the text.\n- **FALSE**: The statement contradicts or is the opposite of the information in the text.\n- **NOT GIVEN**: There is no information about this in the text, or it's impossible to know what the writer thinks about this based *only* on the text.\n\n## The 'Not Given' Trap\nThe most common mistake is using outside knowledge. Even if a fact is universally known to be True, if it is not explicitly stated in the text, the answer is NOT GIVEN.\n\n## Strategy Steps:\n1. **Read the statement first** and identify keywords (especially verbs and adjectives).\n2. **Scan the text** to locate the section where the keywords (or their synonyms) are discussed.\n3. **Read the text carefully**. Does it mean exactly the same thing?\n4. **Check for qualifiers**: Words like *some, all, always, never, mostly, exactly* can completely change the meaning. \n  *Example: Text says 'Some cats hate water.' Statement says 'All cats hate water.' The answer is FALSE.*\n\n### Pro Tip:\nQuestions usually follow the order of the text. If you find the answer to Question 1 in Paragraph 1, and the answer to Question 3 in Paragraph 3, Question 2's answer will almost certainly be in Paragraph 2."
  },
  {
    "id": "lesson-003",
    "courseId": "course-003",
    "title": "Understanding the Band Descriptors",
    "order": 1,
    "durationMinutes": 40,
    "content": "To score a Band 7.0 or higher in Writing Task 2, you must understand exactly how examiners mark your essay. The official public band descriptors evaluate four criteria, each worth 25% of your score.\n\n## 1. Task Response (TR)\n- Did you answer all parts of the prompt?\n- Is your position clear throughout the essay?\n- Are your main ideas extended and supported with relevant examples?\n*Band 7 requirement: Addresses all parts of the task, presents a clear position, and extends main ideas.*\n\n## 2. Coherence and Cohesion (CC)\n- Is the essay logically organized into paragraphs?\n- Is there a clear progression of ideas?\n- Do you use linking words appropriately (without overusing them)?\n*Band 7 requirement: Logically organizes information, clear progression throughout, uses a range of cohesive devices appropriately.*\n\n## 3. Lexical Resource (LR)\n- Do you use a wide range of vocabulary?\n- Do you use less common or idiomatic vocabulary accurately?\n- Are your collocations natural?\n*Band 7 requirement: Uses a sufficient range of vocabulary to allow some flexibility and precision, uses less common lexical items.*\n\n## 4. Grammatical Range and Accuracy (GRA)\n- Do you use a variety of complex sentence structures?\n- Are most of your sentences error-free?\n*Band 7 requirement: Uses a variety of complex structures, produces frequent error-free sentences.*\n\n### Action Plan:\nStop writing blindly. Before your next practice essay, read the prompt and spend 5 minutes planning your paragraphs to ensure a perfect Task Response."
  },
  {
    "id": "lesson-004",
    "courseId": "course-003",
    "title": "The Opinion Essay (Agree/Disagree)",
    "order": 2,
    "durationMinutes": 60,
    "content": "The Opinion essay is one of the most common Task 2 prompts. It will typically state a premise and ask: *To what extent do you agree or disagree?*\n\n## Recommended Structure (4 Paragraphs)\n\n### Paragraph 1: Introduction (2-3 sentences)\n- **Hook / Background:** Paraphrase the prompt.\n- **Thesis Statement:** Clearly state your opinion (e.g., 'I completely agree with this view because...').\n\n### Paragraph 2: Body Paragraph 1 (First Reason)\n- **Topic Sentence:** State your first main reason.\n- **Explanation:** Explain *why* this is true or *how* it happens.\n- **Example:** Provide a specific, real-world example.\n- **Result:** Conclude the paragraph by linking back to the topic.\n\n### Paragraph 3: Body Paragraph 2 (Second Reason)\n- **Topic Sentence:** State your second main reason.\n- **Explanation:** Expand on the idea.\n- **Example:** Give another specific example.\n\n### Paragraph 4: Conclusion (1-2 sentences)\n- **Restatement:** Summarize your main points and restate your opinion in different words.\n- *Never introduce new ideas in the conclusion!*\n\n## Useful Vocabulary:\n- *I firmly believe that...*\n- *It is undeniable that...*\n- *A prime example of this is...*\n- *Consequently...*"
  },
  {
    "id": "lesson-005",
    "courseId": "course-002",
    "title": "Section 1: Form Completion Strategy",
    "order": 1,
    "durationMinutes": 45,
    "content": "Section 1 of IELTS Listening is always a conversation between two people set in an everyday social context (e.g., booking a hotel, joining a club). The most common question type here is Form Completion.\n\n## Core Strategies:\n\n1. **Read the Instructions Carefully:**\nAlways check the word limit. 'NO MORE THAN TWO WORDS AND/OR A NUMBER' means exactly that. If the answer is 'red car' and you write 'a red car', you lose the mark.\n\n2. **Predict the Answers:**\nLook at the gaps before the audio starts. Ask yourself: \n- What type of word is missing? A noun, verb, or adjective?\n- What kind of information is it? A name, date, telephone number, or price?\n\n3. **Watch out for Spelling and Numbers:**\nSpeakers will often spell out names or addresses. You must know the English alphabet perfectly. (Be careful with A/E/I and G/J).\n\n4. **Beware of Distractors:**\nThe speakers will often give one piece of information, then correct themselves. \n*Example:* 'I'd like to book it for the 14th... Oh wait, my wife is busy then, let's make it the 16th.' The answer is 16th, not 14th.\n\n### Practice Drill:\nHave a friend spell 10 random names and read 10 random phone numbers to you while you write them down quickly."
  },
  {
    "id": "lesson-006",
    "courseId": "course-004",
    "title": "Part 2: The 1-Minute Prep Strategy",
    "order": 2,
    "durationMinutes": 45,
    "content": "In Speaking Part 2, you are given a cue card with a topic and 3-4 bullet points. You have exactly 1 minute to prepare, and you must speak for 1 to 2 minutes.\n\n## How to Use Your 1 Minute Effectively\nMany students waste this time writing full sentences. **Don't do this.** You will end up reading from the paper, which lowers your fluency and pronunciation scores.\n\n### The 'Keyword Map' Strategy:\n1. Divide your scratch paper into 4 quadrants (one for each bullet point).\n2. Write down 2-3 **Keywords** or **Collocations** for each quadrant.\n3. Think of one specific 'Story' or memory to tie it all together.\n\n## Structuring Your 2-Minute Talk:\n- **Introduction (15 sec):** 'I'd like to talk about a time when...'\n- **Past Details (30 sec):** Discuss the background. Use Past Continuous ('I was walking...') and Past Perfect ('I had never seen...').\n- **Core Description (45 sec):** Answer the main part of the prompt. Use descriptive adjectives.\n- **Conclusion / Feelings (30 sec):** 'Looking back, I felt incredibly...' This directly answers the final bullet point usually asking about your feelings.\n\n### Emergency Tactic:\nIf you run out of things to say at 1 minute 30 seconds, shift to the future or a hypothetical: *'If I had the chance to do it again, I would...'* or *'I hope to experience something similar in the future because...'*."
  },
  {
    "id": "lesson-007",
    "courseId": "course-005",
    "title": "Line Graphs: Describing Trends",
    "order": 1,
    "durationMinutes": 50,
    "content": "Academic Writing Task 1 requires you to write at least 150 words summarizing visual information. Line graphs are incredibly common and require specific vocabulary to describe changes over time.\n\n## The Essential Structure\n1. **Introduction:** Paraphrase the prompt. (e.g., 'The line graph illustrates the changes in...')\n2. **Overview:** Identify the 2 or 3 main trends. (e.g., 'Overall, it is clear that X increased significantly, while Y saw a dramatic decline.') *Never include specific numbers in the overview.*\n3. **Body Paragraph 1:** Detail the first main trend with data (years and numbers).\n4. **Body Paragraph 2:** Detail the remaining trends, comparing them to Paragraph 1 where relevant.\n\n## Crucial Vocabulary for Trends\n\n### Upward Trend:\n- Verbs: *increased, rose, climbed, surged, skyrocketed*\n- Nouns: *an increase, a rise, an upward trend*\n\n### Downward Trend:\n- Verbs: *decreased, fell, dropped, declined, plummeted*\n- Nouns: *a decrease, a fall, a drop*\n\n### Stability and Fluctuation:\n- *remained stable, leveled off, plateaued*\n- *fluctuated wildly, showed erratic changes*\n\n### Adjectives / Adverbs of Degree:\n- *significant / significantly*\n- *dramatic / dramatically*\n- *slight / slightly*\n- *gradual / gradually*\n\n**Example Sentence:**\n'The number of tourists *rose dramatically* from 1 million in 2000 to just under 4 million in 2010.'"
  }
];

// Re-assign lessons completely to replace mock lessons
db.lessons = newLessons;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated courses and lessons to professional IELTS content.');
